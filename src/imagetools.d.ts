// vite-imagetools query imports, e.g. './photo.png?w=1120&format=webp', resolve to a URL
declare module '*format=webp' {
  const src: string;
  export default src;
}
