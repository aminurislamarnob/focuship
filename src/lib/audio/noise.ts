type Color = "white" | "pink" | "brown";

const SECONDS = 10;
const SEAM_SECONDS = 0.75;
const TARGET_RMS = 0.2;

const cache = new WeakMap<BaseAudioContext, Map<Color, AudioBuffer>>();

/** A stereo noise sample whose end blends into its start, so it loops without a click. */
export function getNoiseBuffer(ctx: BaseAudioContext, color: Color): AudioBuffer {
  let byColor = cache.get(ctx);
  if (!byColor) cache.set(ctx, (byColor = new Map()));
  const cached = byColor.get(color);
  if (cached) return cached;

  const rate = ctx.sampleRate;
  const length = Math.floor(rate * SECONDS);
  const seam = Math.floor(rate * SEAM_SECONDS);
  const buffer = ctx.createBuffer(2, length, rate);

  for (let channel = 0; channel < 2; channel++) {
    const raw = new Float32Array(length + seam);
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let brown = 0;
    for (let i = 0; i < raw.length; i++) {
      const white = Math.random() * 2 - 1;
      if (color === "white") {
        raw[i] = white;
      } else if (color === "pink") {
        // Paul Kellet's economy pink filter.
        b0 = 0.99765 * b0 + white * 0.099046;
        b1 = 0.963 * b1 + white * 0.2965164;
        b2 = 0.57 * b2 + white * 1.0526913;
        raw[i] = b0 + b1 + b2 + white * 0.1848;
      } else {
        brown = (brown + 0.02 * white) / 1.02;
        raw[i] = brown;
      }
    }

    let energy = 0;
    for (let i = 0; i < length; i++) energy += raw[i] * raw[i];
    const scale = TARGET_RMS / Math.sqrt(energy / length);

    const out = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      let sample = raw[i];
      if (i < seam) {
        // The tail continues past the loop point; fold it into the head.
        const t = (i / seam) * (Math.PI / 2);
        sample = raw[i] * Math.sin(t) + raw[length + i] * Math.cos(t);
      }
      out[i] = Math.max(-1, Math.min(1, sample * scale));
    }
  }

  byColor.set(color, buffer);
  return buffer;
}
