// Renders the app icon set from one SVG. Run: npm run icons
import { mkdir, unlink, writeFile } from "node:fs/promises";
import sharp from "sharp";

const BG = "#0a0a0a";
const BRAND = "#d25611";
const FG = "#fafafa";

/** Corner brackets around three level bars, drawn on a 100-unit grid. */
function mark({ scale = 1, background = BG, bars = FG, brackets = BRAND } = {}) {
  const offset = (100 - 100 * scale) / 2;
  const t = `translate(${offset} ${offset}) scale(${scale})`;
  const corner = "M22 36V22h14 M64 22h14v14 M78 64v14H64 M36 78H22V64";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  ${background ? `<rect width="100" height="100" fill="${background}"/>` : ""}
  <g transform="${t}">
    <path d="${corner}" fill="none" stroke="${brackets}" stroke-width="6" stroke-linecap="square"/>
    <rect x="35" y="44" width="7" height="22" fill="${bars}"/>
    <rect x="46.5" y="34" width="7" height="32" fill="${bars}"/>
    <rect x="58" y="50" width="7" height="16" fill="${bars}"/>
  </g>
</svg>`;
}

const out = new URL("../public/icons/", import.meta.url);
await mkdir(out, { recursive: true });

const render = (svg, size, file) =>
  sharp(Buffer.from(svg), { density: 600 }).resize(size, size).png().toFile(new URL(file, out).pathname);

await Promise.all([
  render(mark(), 192, "icon-192.png"),
  render(mark(), 512, "icon-512.png"),
  // Maskable icons keep the artwork inside the central 80% safe zone.
  render(mark({ scale: 0.78 }), 512, "maskable-512.png"),
  render(mark({ scale: 1.08 }), 180, "apple-touch-icon.png"),
  // Android draws notification badges as a white silhouette.
  render(mark({ background: null, bars: "#fff", brackets: "#fff" }), 96, "badge-96.png"),
]);

const app = new URL("../src/app/", import.meta.url);
await sharp(Buffer.from(mark()), { density: 600 }).resize(64, 64).png().toFile(new URL("icon.png", app).pathname);
await writeFile(new URL("icon.svg", out), mark());
await unlink(new URL("favicon.ico", app)).catch(() => {});

console.log("Icons written to public/icons and src/app/icon.png");
