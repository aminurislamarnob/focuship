const urls = new Map<string, Promise<string>>();

/**
 * Fetch a sound once and play it from memory. A whole-file GET (rather than
 * the range requests a media element makes) is what the service worker can
 * cache for offline use.
 */
export function loadSoundUrl(path: string): Promise<string> {
  let url = urls.get(path);
  if (!url) {
    url = fetch(path)
      .then((res) => (res.ok ? res.blob() : Promise.reject(new Error(`${res.status} ${path}`))))
      .then((blob) => URL.createObjectURL(blob));
    url.catch(() => urls.delete(path));
    urls.set(path, url);
  }
  return url;
}

let silent: string | undefined;

/** Three seconds of 8 kHz, 8-bit mono silence as a WAV blob URL. */
export function silentUrl(): string {
  if (!silent) {
    const rate = 8000;
    const samples = rate * 3;
    const bytes = new Uint8Array(44 + samples).fill(128, 44);
    const view = new DataView(bytes.buffer);
    const text = (offset: number, value: string) =>
      [...value].forEach((ch, i) => view.setUint8(offset + i, ch.charCodeAt(0)));
    text(0, "RIFF");
    view.setUint32(4, 36 + samples, true);
    text(8, "WAVE");
    text(12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, rate, true);
    view.setUint32(28, rate, true);
    view.setUint16(32, 1, true);
    view.setUint16(34, 8, true);
    text(36, "data");
    view.setUint32(40, samples, true);
    silent = URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
  }
  return silent;
}
