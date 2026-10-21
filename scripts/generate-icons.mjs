// Renders the app icon set from one SVG. Run: npm run icons
import { mkdir, unlink, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BG = "#0e0c0b";
const RING = "#e8e6e3";
const EMBER = "#f08a4b";

/**
 * An open timer ring around an ember dot, over a warm glow, drawn on a 100-unit grid.
 * `scale` sizes the mark; `stroke` and `dot` thicken it for small sizes; `radius` rounds the tile.
 */
function mark({ scale = 0.65, stroke = 4.5, dot = 6, radius = 0, background = true, ring = RING, ember = EMBER } = {}) {
  const s = (100 * scale) / 64;
  const offset = (100 - 64 * s) / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <radialGradient id="glow" cx="0.7" cy="0.25" r="0.9">
      <stop offset="0" stop-color="#ea580c" stop-opacity="0.28"/>
      <stop offset="0.45" stop-color="#9a3412" stop-opacity="0.12"/>
      <stop offset="0.75" stop-color="${BG}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${background ? `<rect width="100" height="100" rx="${radius}" fill="${BG}"/><rect width="100" height="100" rx="${radius}" fill="url(#glow)"/>` : ""}
  <g transform="translate(${offset} ${offset}) scale(${s})">
    <circle cx="32" cy="32" r="21" fill="none" stroke="${ring}" stroke-width="${stroke}" stroke-linecap="round" stroke-dasharray="108 24" transform="rotate(-62 32 32)"/>
    <circle cx="32" cy="32" r="${dot}" fill="${ember}"/>
  </g>
</svg>`;
}

const out = new URL("../public/icons/", import.meta.url);
await mkdir(out, { recursive: true });

const render = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toFile(new URL(file, out).pathname);

// The favicon renders at 16–32px, so its strokes are the heaviest.
const favicon = mark({ scale: 0.75, stroke: 7, dot: 8, radius: 25 });

await Promise.all([
  render(mark(), 192, "icon-192.png"),
  render(mark(), 512, "icon-512.png"),
  // Maskable icons keep the artwork inside the central 80% safe zone.
  render(mark({ scale: 0.52 }), 512, "maskable-512.png"),
  render(mark(), 180, "apple-touch-icon.png"),
  // Android draws notification badges as a white silhouette.
  render(mark({ background: false, scale: 0.8, stroke: 6, dot: 7.5, ring: "#fff", ember: "#fff" }), 96, "badge-96.png"),
]);

const app = new URL("../src/app/", import.meta.url);
await sharp(Buffer.from(favicon), { density: 600 }).resize(64, 64).png().toFile(new URL("icon.png", app).pathname);
await writeFile(new URL("icon.svg", out), favicon);
await unlink(new URL("favicon.ico", app)).catch(() => {});

console.log("Icons written to public/icons and src/app/icon.png");
