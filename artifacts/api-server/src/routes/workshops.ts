import { clerkClient, getAuth } from "@clerk/express";
import {
  rsvpsTable,
  usersTable,
  workshopsTable,
} from "@workspace/db/schema";
import {
  CreateWorkshopRsvpParams,
  DeleteWorkshopRsvpParams,
  GetWorkshopParams,
  MigrateMyRsvpsBody,
} from "@workspace/api-zod";
import { and, asc, eq, sql } from "drizzle-orm";
import { Router, type IRouter, type RequestHandler } from "express";
import { logger } from "../lib/logger";
import { neonDb } from "../lib/neon-db";
import { sendRsvpCountWebhook } from "../lib/rsvp-webhook";

const router: IRouter = Router();

const requireCustomer: RequestHandler = (req, res, next) => {
  const { userId } = getAuth(req);
  if (!userId) {
    res.status(401).json({ error: "Sign in to view or save RSVPs." });
    return;
  }

  res.locals.clerkUserId = userId;
  next();
};

function toWorkshopResponse(row: typeof workshopsTable.$inferSelect) {
  const date = new Date(`${row.date}T12:00:00.000Z`);
  const dateLabel = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
  const dateLong = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    date: row.date,
    dateLabel,
    dateLong,
    time: row.time,
    duration: row.duration,
    venue: row.venue,
    address: row.address,
    host: row.host,
    hostNote: row.hostNote,
    capacity: row.capacity,
    seatsReserved: row.seatsReserved,
    available: Math.max(0, row.capacity - row.seatsReserved),
    description: row.description,
    image: row.image,
    color: row.color,
    includes: row.includes,
  };
}

async function getCustomerProfile(clerkUserId: string) {
  const clerkUser = await clerkClient.users.getUser(clerkUserId);
  return {
    id: clerkUser.id,
    email:
      clerkUser.primaryEmailAddress?.emailAddress ??
      clerkUser.emailAddresses[0]?.emailAddress ??
      null,
    fullName: clerkUser.fullName,
  };
}

async function saveCustomerProfile(clerkUserId: string) {
  const profile = await getCustomerProfile(clerkUserId);
  await neonDb
    .insert(usersTable)
    .values(profile)
    .onConflictDoUpdate({
      target: usersTable.id,
      set: {
        email: profile.email,
        fullName: profile.fullName,
        updatedAt: new Date(),
      },
    });
}

router.get("/workshops", async (_req, res) => {
  try {
    const rows = await neonDb
      .select()
      .from(workshopsTable)
      .orderBy(asc(workshopsTable.date), asc(workshopsTable.time));
    res.json(rows.map(toWorkshopResponse));
  } catch (err) {
    logger.error({ err }, "Failed to list Gather workshops");
    res.status(500).json({ error: "Workshops could not be loaded." });
  }
});

router.get("/workshops/:workshopId", async (req, res) => {
  const params = GetWorkshopParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "A valid workshop ID is required." });
    return;
  }

  try {
    const [row] = await neonDb
      .select()
      .from(workshopsTable)
      .where(eq(workshopsTable.id, params.data.workshopId))
      .limit(1);
    if (!row) {
      res.status(404).json({ error: "Workshop not found." });
      return;
    }
    res.json(toWorkshopResponse(row));
  } catch (err) {
    logger.error({ err }, "Failed to load a Gather workshop");
    res.status(500).json({ error: "Workshop details could not be loaded." });
  }
});

router.get("/me/rsvps", requireCustomer, async (_req, res) => {
  const clerkUserId = res.locals.clerkUserId as string;
  try {
    await saveCustomerProfile(clerkUserId);
    const rows = await neonDb
      .select({ rsvp: rsvpsTable, workshop: workshopsTable })
      .from(rsvpsTable)
      .innerJoin(
        workshopsTable,
        eq(rsvpsTable.workshopId, workshopsTable.id),
      )
      .where(eq(rsvpsTable.userId, clerkUserId))
      .orderBy(asc(workshopsTable.date), asc(workshopsTable.time));

    res.json(
      rows.map(({ rsvp, workshop }) => ({
        id: rsvp.id,
        createdAt: rsvp.createdAt,
        workshop: toWorkshopResponse(workshop),
      })),
    );
  } catch (err) {
    logger.error({ err }, "Failed to load a customer's Gather RSVPs");
    res.status(500).json({ error: "Your RSVPs could not be loaded." });
  }
});

router.post("/me/rsvps/migrate", requireCustomer, async (req, res) => {
  const body = MigrateMyRsvpsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: "Legacy RSVP data is invalid." });
    return;
  }

  const clerkUserId = res.locals.clerkUserId as string;
  try {
    const profile = await getCustomerProfile(clerkUserId);
    const workshopIds = Array.from(new Set(body.data.legacyWorkshopIds)).sort();
    const migration = await neonDb.transaction(async (tx) => {
      await tx
        .insert(usersTable)
        .values(profile)
        .onConflictDoUpdate({
          target: usersTable.id,
          set: {
            email: profile.email,
            fullName: profile.fullName,
            updatedAt: new Date(),
          },
        });

      const migratedWorkshopIds: string[] = [];
      const alreadyPresentWorkshopIds: string[] = [];
      const skippedFullWorkshopIds: string[] = [];
      const unknownWorkshopIds: string[] = [];

      for (const workshopId of workshopIds) {
        const [workshop] = await tx
          .select()
          .from(workshopsTable)
          .where(eq(workshopsTable.id, workshopId))
          .for("update")
          .limit(1);
        if (!workshop) {
          unknownWorkshopIds.push(workshopId);
          continue;
        }

        const [existingRsvp] = await tx
          .select({ id: rsvpsTable.id })
          .from(rsvpsTable)
          .where(
            and(
              eq(rsvpsTable.userId, clerkUserId),
              eq(rsvpsTable.workshopId, workshopId),
            ),
          )
          .limit(1);
        if (existingRsvp) {
          alreadyPresentWorkshopIds.push(workshopId);
          continue;
        }

        if (workshop.seatsReserved >= workshop.capacity) {
          skippedFullWorkshopIds.push(workshopId);
          continue;
        }

        await tx.insert(rsvpsTable).values({
          userId: clerkUserId,
          workshopId,
        });
        await tx
          .update(workshopsTable)
          .set({
            seatsReserved: sql`${workshopsTable.seatsReserved} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(workshopsTable.id, workshopId));
        migratedWorkshopIds.push(workshopId);
      }

      return {
        migratedWorkshopIds,
        alreadyPresentWorkshopIds,
        skippedFullWorkshopIds,
        unknownWorkshopIds,
      };
    });

    res.json(migration);
  } catch (err) {
    logger.error({ err }, "Failed to migrate a customer's legacy Gather RSVPs");
    res.status(500).json({ error: "Your saved RSVPs could not be migrated." });
  }
});

router.post(
  "/workshops/:workshopId/rsvps",
  requireCustomer,
  async (req, res) => {
    const params = CreateWorkshopRsvpParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "A valid workshop ID is required." });
      return;
    }

    const clerkUserId = res.locals.clerkUserId as string;
    try {
      const profile = await getCustomerProfile(clerkUserId);
      const result = await neonDb.transaction(async (tx) => {
        const [workshop] = await tx
          .select()
          .from(workshopsTable)
          .where(eq(workshopsTable.id, params.data.workshopId))
          .for("update")
          .limit(1);
        if (!workshop) return { kind: "missing" as const };

        const [existingRsvp] = await tx
          .select()
          .from(rsvpsTable)
          .where(
            and(
              eq(rsvpsTable.userId, clerkUserId),
              eq(rsvpsTable.workshopId, workshop.id),
            ),
          )
          .limit(1);
        if (existingRsvp) {
          return { kind: "existing" as const, rsvp: existingRsvp };
        }

        if (workshop.seatsReserved >= workshop.capacity) {
          return { kind: "full" as const };
        }

        await tx
          .insert(usersTable)
          .values(profile)
          .onConflictDoUpdate({
            target: usersTable.id,
            set: {
              email: profile.email,
              fullName: profile.fullName,
              updatedAt: new Date(),
            },
          });

        const [rsvp] = await tx
          .insert(rsvpsTable)
          .values({ userId: clerkUserId, workshopId: workshop.id })
          .returning();
        await tx
          .update(workshopsTable)
          .set({
            seatsReserved: sql`${workshopsTable.seatsReserved} + 1`,
            updatedAt: new Date(),
          })
          .where(eq(workshopsTable.id, workshop.id));

        return {
          kind: "created" as const,
          rsvp,
          workshop,
          newRsvpCount: workshop.seatsReserved + 1,
        };
      });

      if (result.kind === "missing") {
        res.status(404).json({ error: "Workshop not found." });
        return;
      }
      if (result.kind === "full") {
        res.status(409).json({ error: "This workshop is fully booked." });
        return;
      }

      if (result.kind === "created") {
        await sendRsvpCountWebhook({
          workshopName: result.workshop.title,
          rsvps: result.newRsvpCount,
          updatedAt: result.rsvp.createdAt.toISOString(),
        });
      }

      res
        .status(result.kind === "created" ? 201 : 200)
        .json({
          id: result.rsvp.id,
          workshopId: result.rsvp.workshopId,
          createdAt: result.rsvp.createdAt,
          alreadyRegistered: result.kind === "existing",
        });
    } catch (err) {
      logger.error({ err }, "Failed to save a Gather RSVP");
      res.status(500).json({ error: "Your RSVP could not be saved." });
    }
  },
);

router.delete(
  "/workshops/:workshopId/rsvps",
  requireCustomer,
  async (req, res): Promise<void> => {
    const params = DeleteWorkshopRsvpParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: "A valid workshop ID is required." });
      return;
    }

    const clerkUserId = res.locals.clerkUserId as string;
    try {
      const result = await neonDb.transaction(async (tx) => {
        const [workshop] = await tx
          .select()
          .from(workshopsTable)
          .where(eq(workshopsTable.id, params.data.workshopId))
          .for("update")
          .limit(1);
        if (!workshop) return { kind: "missing" as const };

        const [rsvp] = await tx
          .select({ id: rsvpsTable.id })
          .from(rsvpsTable)
          .where(
            and(
              eq(rsvpsTable.userId, clerkUserId),
              eq(rsvpsTable.workshopId, workshop.id),
            ),
          )
          .limit(1);
        if (!rsvp) return { kind: "absent" as const };

        await tx.delete(rsvpsTable).where(eq(rsvpsTable.id, rsvp.id));
        const newRsvpCount = Math.max(0, workshop.seatsReserved - 1);
        const updatedAt = new Date();
        await tx
          .update(workshopsTable)
          .set({ seatsReserved: newRsvpCount, updatedAt })
          .where(eq(workshopsTable.id, workshop.id));

        return {
          kind: "removed" as const,
          workshopName: workshop.title,
          newRsvpCount,
          updatedAt: updatedAt.toISOString(),
        };
      });

      if (result.kind === "missing") {
        res.status(404).json({ error: "Workshop not found." });
        return;
      }
      if (result.kind === "removed") {
        await sendRsvpCountWebhook({
          workshopName: result.workshopName,
          rsvps: result.newRsvpCount,
          updatedAt: result.updatedAt,
        });
      }
      res.sendStatus(204);
    } catch (err) {
      logger.error({ err }, "Failed to remove a Gather RSVP");
      res.status(500).json({ error: "Your RSVP could not be removed." });
    }
  },
);

export default router;
