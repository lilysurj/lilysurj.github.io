const imageModules = import.meta.glob<{ default: string }>(
  './assets/gallery/*.{jpg,jpeg,png,webp,JPG,JPEG,PNG,WEBP,gif,GIF,avif,AVIF}',
  { eager: true },
);

export const ALL_PHOTOS = Object.entries(imageModules).map(([path, m]) => ({
  src: m.default,
  filename: path.split('/').pop()!,
}));

export const DEFAULT_TAG = 'shot on film';

const DIGI_FILES = new Set([
  'bowls.jpeg', 'arlington.jpeg', 'getty.jpeg', 'hochsgiving.jpeg',
  'laguna.jpeg', 'louvre.jpeg', 'metro.jpeg', 'seine.jpeg',
]);

const IPHONE_FILES = new Set([
  'ducks.jpeg', 'greenhouse.jpeg', 'new_york.jpeg',
]);

const CAPTIONS: Record<string, string> = {
  'arlington.jpeg':      'arlington',
  'big_shan.jpeg':       'big shan',
  'bowls.jpeg':          'clinamen',
  'ducks.jpeg':          'ducks',
  'foothill_blvd.jpeg':  'foothill blvd',
  'friends.JPG':         'big bear!',
  'getty.jpeg':          'getty',
  'green_beach.jpeg':    'green',
  'greenhouse.jpeg':     'us botanical garden',
  'hackathon.JPG':       '#WomenInStem',
  'hochsgiving.jpeg':    'hochsgiving',
  'laguna.jpeg':         'laguna',
  'louvre.jpeg':         'louvre',
  'max.jpeg':            'mmc',
  'megan_and_peen.jpeg': 'scripps larp',
  'metro.jpeg':          'play sunflower',
  'new_york.jpeg':       'brooklyn bridge',
  'seine.jpeg':          'swimming in the seine',
  'tiernan.jpg':         'washed'
};

export function getTag(filename: string): string {
  if (DIGI_FILES.has(filename))   return 'shot on digi';
  if (IPHONE_FILES.has(filename)) return 'shot on iphone';
  return DEFAULT_TAG;
}

export function getCaption(filename: string): string {
  return CAPTIONS[filename] ?? '';
}

// Only "shot on film" photos — used by the cursor photo trail on the homepage
export const FILM_PHOTOS = ALL_PHOTOS
  .filter(({ filename }) => getTag(filename) === DEFAULT_TAG)
  .map(({ src }) => src);
