const imageModules = import.meta.glob<{ default: string }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true },
);

// Small WebP copies of the gallery photos, generated at build time for the cursor trail
const thumbModules = import.meta.glob<{ default: string }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true, query: { w: 480, format: 'webp' } },
);

// Mid-size WebP copies for the gallery grid, so phones don't download the multi-MB originals up front.
// Comes with its dimensions so the grid can lay photos out before they load
const gridModules = import.meta.glob<{ default: { src: string; w: number; h: number } }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true, query: { w: 800, format: 'webp', as: 'img' } },
);

// Pinned spots in the gallery; every other photo fills in around the middle group
const TOP = ['arlington.jpeg', 'new_york.jpeg', 'boston.JPG', 'vets.jpg', 'friends.JPG'];
const MIDDLE = ['bpl.jpg', 'green_beach.jpeg', 'metro.jpeg'];
const BOTTOM = ['foothill_blvd.jpeg'];

function orderFilenames(filenames: string[]): string[] {
  const pinned = new Set([...TOP, ...MIDDLE, ...BOTTOM]);
  const has = (f: string) => filenames.includes(f);
  const rest = filenames.filter(f => !pinned.has(f));
  const half = Math.ceil(rest.length / 2);
  return [
    ...TOP.filter(has),
    ...rest.slice(0, half),
    ...MIDDLE.filter(has),
    ...rest.slice(half),
    ...BOTTOM.filter(has),
  ];
}

const photosByFilename = new Map(
  Object.entries(imageModules).map(([path, m]) => {
    const filename = path.split('/').pop()!;
    const grid = gridModules[path].default;
    return [filename, {
      src: m.default,
      thumb: thumbModules[path].default,
      grid: grid.src,
      aspect: grid.h / grid.w,
      filename,
    }];
  }),
);

export const ALL_PHOTOS = orderFilenames([...photosByFilename.keys()]).map(f => photosByFilename.get(f)!);

const CAPTIONS: Record<string, string> = {
  'arlington.jpeg':      'arlington',
  'bowls.jpeg':          'clinamen',
  'ducks.jpeg':          'ducks',
  'foothill_blvd.jpeg':  'foothill blvd',
  'friends.JPG':         'big bear!',
  'getty.jpeg':          'getty',
  'green_beach.jpeg':    'green',
  'greenhouse.jpeg':     'us botanical garden',
  'laguna.jpeg':         'laguna',
  'louvre.jpeg':         'louvre',
  'max.jpeg':            'mmc',
  'megan_and_peen.jpeg': 'scripps',
  'metro.jpeg':          'sunflower by post malone',
  'new_york.jpeg':       'brooklyn bridge',
  'seine.jpeg':          'seine river',
  'boston.JPG':          'boston public garden',
  'the_odessey.jpg':     'no one',
  'bpl.jpg':             'bpl',
  'rufus.jpg':           'innerbloom',
  'hawaii.jpg':          'oahu',
  'vets.jpg':            'morg + zoe',
  'les_cocottes.JPG':    'les cocottes'
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
