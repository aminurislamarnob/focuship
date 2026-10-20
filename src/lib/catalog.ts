export type CategoryId =
  | "rain"
  | "nature"
  | "animals"
  | "places"
  | "transport"
  | "things"
  | "urban"
  | "generated";

export type SoundSource =
  | { type: "file"; path: string }
  | { type: "noise"; color: "white" | "pink" | "brown" }
  | { type: "binaural"; carrier: number; beat: number }
  | { type: "drone" };

export interface Sound {
  id: string;
  label: string;
  category: CategoryId;
  source: SoundSource;
  /** Loudness trim so that every sound sits at a similar level at 100%. */
  gain: number;
  note?: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  /** Hue used for the ambient background when this category dominates. */
  hue: number;
}

export const CATEGORIES: Category[] = [
  { id: "rain", label: "Rain", hue: 205 },
  { id: "nature", label: "Nature", hue: 150 },
  { id: "animals", label: "Animals", hue: 85 },
  { id: "places", label: "Places", hue: 28 },
  { id: "transport", label: "Transport", hue: 235 },
  { id: "things", label: "Things", hue: 275 },
  { id: "urban", label: "Urban", hue: 215 },
  { id: "generated", label: "Noise & tones", hue: 22 },
];

const file = (
  category: Exclude<CategoryId, "generated">,
  id: string,
  label: string,
  gain = 1,
  note?: string,
): Sound => ({
  id,
  label,
  category,
  source: { type: "file", path: `/sounds/${category}/${id}.mp3` },
  gain,
  note,
});

export const SOUNDS: Sound[] = [
  file("rain", "light-rain", "Light rain"),
  file("rain", "heavy-rain", "Heavy rain"),
  file("rain", "thunder", "Thunder"),
  file("rain", "rain-on-window", "On the window"),
  file("rain", "rain-on-car-roof", "On a car roof"),
  file("rain", "rain-on-umbrella", "On an umbrella"),
  file("rain", "rain-on-tent", "On a tent"),
  file("rain", "rain-on-leaves", "On leaves"),

  file("nature", "river", "River"),
  file("nature", "waves", "Waves"),
  file("nature", "waterfall", "Waterfall"),
  file("nature", "droplets", "Droplets"),
  file("nature", "campfire", "Campfire"),
  file("nature", "wind", "Wind"),
  file("nature", "wind-in-trees", "Wind in trees"),
  file("nature", "jungle", "Jungle"),
  file("nature", "walk-in-snow", "Snow steps"),

  file("animals", "birds", "Birds"),
  file("animals", "crickets", "Crickets"),
  file("animals", "frog", "Frogs"),
  file("animals", "owl", "Owl"),
  file("animals", "seagulls", "Seagulls"),
  file("animals", "whale", "Whale song"),
  file("animals", "cat-purring", "Purring cat"),
  file("animals", "beehive", "Beehive"),

  file("places", "cafe", "Café"),
  file("places", "library", "Library"),
  file("places", "office", "Office"),
  file("places", "restaurant", "Restaurant"),
  file("places", "night-village", "Village at night"),
  file("places", "underwater", "Underwater"),
  file("places", "laboratory", "Laboratory"),
  file("places", "airport", "Airport"),
  file("places", "subway-station", "Subway"),
  file("places", "temple", "Temple"),

  file("transport", "train", "Train"),
  file("transport", "inside-a-train", "Train carriage"),
  file("transport", "airplane", "Cabin hum"),
  file("transport", "sailboat", "Sailboat"),
  file("transport", "rowing-boat", "Rowing boat"),
  file("transport", "submarine", "Submarine"),

  file("things", "keyboard", "Keyboard"),
  file("things", "typewriter", "Typewriter"),
  file("things", "paper", "Paper"),
  file("things", "clock", "Clock"),
  file("things", "ceiling-fan", "Ceiling fan"),
  file("things", "wind-chimes", "Wind chimes"),
  file("things", "boiling-water", "Kettle"),
  file("things", "vinyl-effect", "Vinyl"),
  file("things", "singing-bowl", "Singing bowl"),
  file("things", "washing-machine", "Washer"),

  file("urban", "busy-street", "Busy street"),
  file("urban", "traffic", "Traffic"),
  file("urban", "highway", "Highway"),
  file("urban", "road", "Night road"),
  file("urban", "crowd", "Crowd"),

  {
    id: "brown-noise",
    label: "Brown noise",
    category: "generated",
    source: { type: "noise", color: "brown" },
    gain: 0.6,
    note: "Deep, soft rumble",
  },
  {
    id: "pink-noise",
    label: "Pink noise",
    category: "generated",
    source: { type: "noise", color: "pink" },
    gain: 0.45,
    note: "Even, like steady rain",
  },
  {
    id: "white-noise",
    label: "White noise",
    category: "generated",
    source: { type: "noise", color: "white" },
    gain: 0.25,
    note: "Bright, masks voices",
  },
  {
    id: "starship-hum",
    label: "Starship hum",
    category: "generated",
    source: { type: "drone" },
    gain: 0.6,
    note: "Engine-room drone",
  },
  {
    id: "theta",
    label: "Theta 6 Hz",
    category: "generated",
    source: { type: "binaural", carrier: 180, beat: 6 },
    gain: 0.18,
    note: "Binaural · headphones",
  },
  {
    id: "alpha",
    label: "Alpha 10 Hz",
    category: "generated",
    source: { type: "binaural", carrier: 200, beat: 10 },
    gain: 0.18,
    note: "Binaural · headphones",
  },
  {
    id: "beta",
    label: "Beta 16 Hz",
    category: "generated",
    source: { type: "binaural", carrier: 220, beat: 16 },
    gain: 0.16,
    note: "Binaural · headphones",
  },
  {
    id: "gamma",
    label: "Gamma 40 Hz",
    category: "generated",
    source: { type: "binaural", carrier: 260, beat: 40 },
    gain: 0.14,
    note: "Binaural · headphones",
  },
];

export const SOUND_BY_ID = new Map(SOUNDS.map((s) => [s.id, s]));
export const CATEGORY_BY_ID = new Map(CATEGORIES.map((c) => [c.id, c]));

/** Layer volumes are 0..1. */
export type Layers = Record<string, number>;

export interface Preset {
  id: string;
  label: string;
  blurb: string;
  layers: Layers;
}

export const PRESETS: Preset[] = [
  {
    id: "deep-work",
    label: "Deep work",
    blurb: "Brown noise with a slow alpha pulse",
    layers: { "brown-noise": 0.55, alpha: 0.4 },
  },
  {
    id: "rainy-desk",
    label: "Rainy desk",
    blurb: "Rain on glass and quiet keys",
    layers: { "rain-on-window": 0.6, keyboard: 0.25, "pink-noise": 0.2 },
  },
  {
    id: "corner-cafe",
    label: "Corner café",
    blurb: "Chatter, cups and a drizzle outside",
    layers: { cafe: 0.6, "light-rain": 0.3 },
  },
  {
    id: "storm-watch",
    label: "Storm watch",
    blurb: "Heavy rain, rolling thunder",
    layers: { "heavy-rain": 0.65, thunder: 0.45, wind: 0.2 },
  },
  {
    id: "coastline",
    label: "Coastline",
    blurb: "Waves, gulls and sea air",
    layers: { waves: 0.65, seagulls: 0.15, wind: 0.2 },
  },
  {
    id: "night-camp",
    label: "Night camp",
    blurb: "Crackling fire under the stars",
    layers: { campfire: 0.6, crickets: 0.3, owl: 0.15 },
  },
  {
    id: "reading-room",
    label: "Reading room",
    blurb: "Hushed library, turning pages",
    layers: { library: 0.6, paper: 0.2, clock: 0.12 },
  },
  {
    id: "sleeper-car",
    label: "Sleeper car",
    blurb: "A long train ride through the rain",
    layers: { "inside-a-train": 0.6, "rain-on-window": 0.3 },
  },
  {
    id: "morning-trail",
    label: "Morning trail",
    blurb: "Birdsong over a running stream",
    layers: { birds: 0.45, river: 0.35, "wind-in-trees": 0.25 },
  },
  {
    id: "deep-dive",
    label: "Deep dive",
    blurb: "Submerged and far from everything",
    layers: { submarine: 0.45, underwater: 0.4, "brown-noise": 0.2 },
  },
  {
    id: "deep-space",
    label: "Deep space",
    blurb: "The engine hum of a ship between stars",
    layers: { "starship-hum": 0.6, "brown-noise": 0.15 },
  },
];

export const DEFAULT_PRESET = PRESETS[0];
