const imageModules = import.meta.glob<{ default: string }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true },
);

// Small WebP copies of the gallery photos, generated at build time for the cursor trail
const thumbModules = import.meta.glob<{ default: string }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true, query: { w: 480, format: 'webp' } },
);

export const ALL_PHOTOS = Object.entries(imageModules).map(([path, m]) => ({
  src: m.default,
  thumb: thumbModules[path].default,
  filename: path.split('/').pop()!,
}));

const CAPTIONS: Record<string, string> = {
  'arlington.jpeg':      'arlington',
  'bowls.jpeg':          'clinamen',
  'ducks.jpeg':          'ducks',
  'foothill_blvd.jpeg':  'foothill blvd',
  'friends.JPG':         'big bear!',
  'getty.jpeg':          'getty',
  'green_beach.jpeg':    'green',
  'greenhouse.jpeg':     'us botanical garden',
  'hochsgiving.jpeg':    'hochsgiving',
  'laguna.jpeg':         'laguna',
  'louvre.jpeg':         'louvre',
  'max.jpeg':            'mmc',
  'megan_and_peen.jpeg': 'scripps',
  'metro.jpeg':          'play sunflower by post malone',
  'new_york.jpeg':       'brooklyn bridge',
  'seine.jpeg':          'seine river',
  'boston.JPG':          'boston public garden',
  'the_odessey.jpg':     'no one',
  'bpl.jpg':             'bpl',
  'rufus.jpg':           'innerbloom'
};

export function getCaption(filename: string): string {
  return CAPTIONS[filename] ?? '';
}

const TRAIL_PHOTO_COUNT = 7;

// Cursor photo trail on the homepage: a random 7 gallery photos, re-picked on every page load
function pickRandom<T>(items: T[], count: number): T[] {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}

export const TRAIL_PHOTOS = pickRandom(ALL_PHOTOS, TRAIL_PHOTO_COUNT).map(({ thumb }) => thumb);
