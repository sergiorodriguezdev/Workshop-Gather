import { logger } from "./logger";

type RsvpWebhookPayload = {
  event: "gather.rsvp.created";
  occurredAt: string;
  data: {
    rsvp: {
      id: number;
      createdAt: string;
    };
    customer: {
      id: string;
      name: string | null;
      email: string | null;
    };
    workshop: {
      id: string;
      title: string;
      date: string;
      time: string;
      venue: string;
    };
  };
};

export async function sendRsvpCreatedWebhook(
  payload: RsvpWebhookPayload,
): Promise<void> {
  const webhookUrl = process.env.GATHER_RSVP_WEBHOOK_URL;
  if (!webhookUrl) return;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(webhookUrl);
  } catch {
    logger.warn("Gather RSVP webhook URL is invalid; notification was skipped");
    return;
  }
  if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
    logger.warn("Gather RSVP webhook URL must use HTTP or HTTPS");
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(parsedUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    if (!response.ok) {
      logger.warn(
        { status: response.status, rsvpId: payload.data.rsvp.id },
        "Gather RSVP webhook returned a non-success status",
      );
    }
  } catch {
    logger.warn(
      { rsvpId: payload.data.rsvp.id },
      "Gather RSVP webhook delivery failed",
    );
  } finally {
    clearTimeout(timeout);
  }
}
