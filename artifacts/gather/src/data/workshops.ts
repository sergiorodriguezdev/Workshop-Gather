import ceramicsImage from '../assets/ceramics.jpg';
import flowersImage from '../assets/flowers.jpg';
import printmakingImage from '../assets/printmaking.jpg';
import breadImage from '../assets/bread.jpg';

export type Workshop = {
  id: string;
  title: string;
  category: string;
  dateLabel: string;
  dateLong: string;
  time: string;
  duration: string;
  venue: string;
  address: string;
  host: string;
  hostNote: string;
  capacity: number;
  available: number;
  description: string;
  image: string;
  color: string;
  includes: string[];
};

export const workshops: Workshop[] = [
  {
    id: 'clay-after-hours',
    title: 'Clay after hours',
    category: 'Ceramics',
    dateLabel: 'Sat, Nov 7',
    dateLong: 'Saturday, November 7, 2026',
    time: '2:00–4:30 pm',
    duration: '2.5 hours',
    venue: 'Soft Corner Studio',
    address: '184 Kent Street, Brooklyn',
    host: 'Mara Ellis',
    hostNote: 'Ceramic artist & studio founder',
    capacity: 10,
    available: 3,
    description: 'A slow afternoon at the wheel, with no experience needed. Mara will show you the basics of centering clay, then help you shape a small cup or bowl that feels like yours. We’ll take a break for something warm to drink while the pieces settle.',
    image: ceramicsImage,
    color: '#d98c68',
    includes: ['All clay and studio tools', 'A wheel-side demo with Mara', 'Your piece fired and ready to collect'],
  },
  {
    id: 'flowers-in-the-wild',
    title: 'Flowers in the wild',
    category: 'Flowers',
    dateLabel: 'Sun, Nov 8',
    dateLong: 'Sunday, November 8, 2026',
    time: '11:00 am–1:00 pm',
    duration: '2 hours',
    venue: 'Fieldwork Flowers',
    address: '72 Wythe Avenue, Brooklyn',
    host: 'Jules Bennett',
    hostNote: 'Florist, forager & color enthusiast',
    capacity: 12,
    available: 5,
    description: 'Make an arrangement that looks like it found its way here on its own. Jules will share a few simple ways to work with shape, season and the flowers in front of you. You’ll leave with a loose, generous bouquet and a new eye for the corner-store bunch.',
    image: flowersImage,
    color: '#c98e74',
    includes: ['Seasonal flowers and foliage', 'A reusable flower wrap', 'A small batch drink from the neighborhood'],
  },
  {
    id: 'ink-and-impressions',
    title: 'Ink & impressions',
    category: 'Printmaking',
    dateLabel: 'Thu, Nov 12',
    dateLong: 'Thursday, November 12, 2026',
    time: '6:30–9:00 pm',
    duration: '2.5 hours',
    venue: 'Good Press Workshop',
    address: '41 Franklin Street, Brooklyn',
    host: 'Theo Park',
    hostNote: 'Printmaker & keeper of the big press',
    capacity: 8,
    available: 2,
    description: 'Turn a little drawing into a stack of original prints. Theo will guide you through carving a small linocut, mixing ink and making your first impressions on the studio press. Expect happy accidents, inky fingers and a print worth framing.',
    image: printmakingImage,
    color: '#768c7a',
    includes: ['Carving block and printmaking tools', 'Paper for a small edition of prints', 'Aprons and all the ink you need'],
  },
  {
    id: 'sunday-sourdough',
    title: 'A Sunday sourdough',
    category: 'Food',
    dateLabel: 'Sun, Nov 15',
    dateLong: 'Sunday, November 15, 2026',
    time: '9:30 am–12:30 pm',
    duration: '3 hours',
    venue: 'Daybreak Bread Room',
    address: '260 Atlantic Avenue, Brooklyn',
    host: 'Nico Alvarez',
    hostNote: 'Baker, starter keeper & morning person',
    capacity: 10,
    available: 4,
    description: 'Get to know the gentle rhythm of a good loaf. Nico will demystify starter, show you how dough feels at each stage and help you shape a loaf to take home and bake. We’ll snack on warm bread while the coffee is still hot.',
    image: breadImage,
    color: '#c39a63',
    includes: ['Your own live starter to take home', 'A dough to shape and bake at home', 'Coffee and bread from the bakery'],
  },
];

export const categories = ['Everything', 'Ceramics', 'Flowers', 'Printmaking', 'Food'];

export function getWorkshop(id: string) {
  return workshops.find((workshop) => workshop.id === id);
}
