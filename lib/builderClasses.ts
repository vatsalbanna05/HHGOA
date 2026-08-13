export const BUILDER_CLASSES = [
  "VISIONARY BUILDER",
  "CODE ALCHEMIST",
  "AI ARCHITECT",
  "GOA EXPLORER",
  "TECH MAVERICK",
  "SHIP-IT CAPTAIN",
  "PIXEL PIONEER",
  "RUST WRANGLER",
  "NEURAL CRAFTER",
  "PROTOCOL KNIGHT",
  "KERNEL WIZARD",
  "DATA SHAMAN",
  "PROMPT MAGlCIAN",
  "STACK SURFER",
  "SOLANA NINJA",
  "BYTE MONK"
] as const;

export type BuilderClass = typeof BUILDER_CLASSES[number];

export function generateBuilderClass(current?: string): BuilderClass {
  const filtered = BUILDER_CLASSES.filter(c => c !== current);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export type FrameThemeId = 'GOA_CLASSIC' | 'HACKER_HOUSE' | 'SUNSET_HACKER' | 'TROPICAL_CODE' | 'NIGHT_SHIFT';

export interface FrameTheme {
  id: FrameThemeId;
  name: string;
  tagline: string;
  bgGradient: [string, string, string];
  primaryGold: string;
  accentColor: string;
  ornamentStyle: 'lotus' | 'circuits' | 'palms' | 'foliage' | 'stars';
  cardBg: string;
}

export const FRAME_THEMES: Record<FrameThemeId, FrameTheme> = {
  GOA_CLASSIC: {
    id: 'GOA_CLASSIC',
    name: 'Goa Classic',
    tagline: 'Traditional Indian filigree & emerald festival gold',
    bgGradient: ['#04140C', '#0A2B1D', '#04140C'],
    primaryGold: '#F3C048',
    accentColor: '#E86A23',
    ornamentStyle: 'lotus',
    cardBg: '#092116'
  },
  HACKER_HOUSE: {
    id: 'HACKER_HOUSE',
    name: 'Hacker House',
    tagline: 'Cyber terminal code traces & gold circuits',
    bgGradient: ['#020D09', '#082115', '#020C07'],
    primaryGold: '#F3C048',
    accentColor: '#D93B78',
    ornamentStyle: 'circuits',
    cardBg: '#06170F'
  },
  SUNSET_HACKER: {
    id: 'SUNSET_HACKER',
    name: 'Sunset Hacker',
    tagline: 'Goan dusk indigo, magenta horizon & golden stars',
    bgGradient: ['#120B24', '#2B0D29', '#081C16'],
    primaryGold: '#FFDF78',
    accentColor: '#FF5C93',
    ornamentStyle: 'palms',
    cardBg: '#1A0C22'
  },
  TROPICAL_CODE: {
    id: 'TROPICAL_CODE',
    name: 'Tropical Code',
    tagline: 'Lush Goan fronds & binary matrix details',
    bgGradient: ['#041A10', '#0E3A26', '#03140C'],
    primaryGold: '#F3C048',
    accentColor: '#9AD95C',
    ornamentStyle: 'foliage',
    cardBg: '#09291B'
  },
  NIGHT_SHIFT: {
    id: 'NIGHT_SHIFT',
    name: 'Night Shift',
    tagline: 'Midnight Goan sky, glowing gold mandala',
    bgGradient: ['#02090C', '#071A24', '#020D08'],
    primaryGold: '#F3C048',
    accentColor: '#58D68D',
    ornamentStyle: 'stars',
    cardBg: '#05131A'
  }
};