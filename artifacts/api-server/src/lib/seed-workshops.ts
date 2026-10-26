import type { InsertWorkshop } from "@workspace/db/schema";
import { workshopsTable } from "@workspace/db/schema";
import { neonDb } from "./neon-db";

const initialWorkshops: InsertWorkshop[] = [
  {
    id: "clay-after-hours",
    title: "Clay after hours",
    category: "Ceramics",
    date: "2026-11-07",
    time: "2:00–4:30 pm",
    duration: "2.5 hours",
    venue: "Soft Corner Studio",
    address: "184 Kent Street, Brooklyn",
    host: "Mara Ellis",
    hostNote: "Ceramic artist & studio founder",
    capacity: 10,
    seatsReserved: 0,
    description:
      "A slow afternoon at the wheel, with no experience needed. Mara will show you the basics of centering clay, then help you shape a small cup or bowl that feels like yours. We’ll take a break for something warm to drink while the pieces settle.",
    image: "/workshops/ceramics.jpg",
    color: "#d98c68",
    includes: [
      "All clay and studio tools",
      "A wheel-side demo with Mara",
      "Your piece fired and ready to collect",
    ],
  },
  {
    id: "flowers-in-the-wild",
    title: "Flowers in the wild",
    category: "Flowers",
    date: "2026-11-08",
    time: "11:00 am–1:00 pm",
    duration: "2 hours",
    venue: "Fieldwork Flowers",
    address: "72 Wythe Avenue, Brooklyn",
    host: "Jules Bennett",
    hostNote: "Florist, forager & color enthusiast",
    capacity: 12,
    seatsReserved: 0,
    description:
      "Make an arrangement that looks like it found its way here on its own. Jules will share a few simple ways to work with shape, season and the flowers in front of you. You’ll leave with a loose, generous bouquet and a new eye for the corner-store bunch.",
    image: "/workshops/flowers.jpg",
    color: "#c98e74",
    includes: [
      "Seasonal flowers and foliage",
      "A reusable flower wrap",
      "A small batch drink from the neighborhood",
    ],
  },
  {
    id: "ink-and-impressions",
    title: "Ink & impressions",
    category: "Printmaking",
    date: "2026-11-12",
    time: "6:30–9:00 pm",
    duration: "2.5 hours",
    venue: "Good Press Workshop",
    address: "41 Franklin Street, Brooklyn",
    host: "Theo Park",
    hostNote: "Printmaker & keeper of the big press",
    capacity: 8,
    seatsReserved: 0,
    description:
      "Turn a little drawing into a stack of original prints. Theo will guide you through carving a small linocut, mixing ink and making your first impressions on the studio press. Expect happy accidents, inky fingers and a print worth framing.",
    image: "/workshops/printmaking.jpg",
    color: "#768c7a",
    includes: [
      "Carving block and printmaking tools",
      "Paper for a small edition of prints",
      "Aprons and all the ink you need",
    ],
  },
  {
    id: "sunday-sourdough",
    title: "A Sunday sourdough",
    category: "Food",
    date: "2026-11-15",
    time: "9:30 am–12:30 pm",
    duration: "3 hours",
    venue: "Daybreak Bread Room",
    address: "260 Atlantic Avenue, Brooklyn",
    host: "Nico Alvarez",
    hostNote: "Baker, starter keeper & morning person",
    capacity: 10,
    seatsReserved: 0,
    description:
      "Get to know the gentle rhythm of a good loaf. Nico will demystify starter, show you how dough feels at each stage and help you shape a loaf to take home and bake. We’ll snack on warm bread while the coffee is still hot.",
    image: "/workshops/bread.jpg",
    color: "#c39a63",
    includes: [
      "Your own live starter to take home",
      "A dough to shape and bake at home",
      "Coffee and bread from the bakery",
    ],
  },
];

export async function seedInitialWorkshops() {
  await neonDb
    .insert(workshopsTable)
    .values(initialWorkshops)
    .onConflictDoNothing();
}
