"use client";

import { Check, Download, Share, SquarePlus, WifiOff } from "lucide-react";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SOUNDS } from "@/lib/catalog";
import { countCached, downloadSounds, isIos, isStandalone, useInstallPrompt } from "@/lib/pwa";
import { Sheet } from "./ui";

const noSubscribe = () => () => {};
const FILE_PATHS =SOUNDS.flatMap((s) => (s.source.type === "file" ? [s.source.path] : []));
const SHORTCUTS: [string, string][] = [
  ["Space", "Play / pause"],
  ["F", "Focus mode"],
  ["M", "Mute"],
  ["1 2 3", "Switch tabs"],
];

export function AboutSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const { canPrompt, install } = useInstallPrompt();
  const env = {
    standalone: useSyncExternalStore(noSubscribe, isStandalone, () => false),
    ios: useSyncExternalStore(noSubscribe, isIos, () => false),
  };
  const [cached, setCached] = useState<number | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) countCached(FILE_PATHS).then(setCached);
  }, [open]);

  const download = async () => {
    setError("");
    setProgress(0);
    try {
      await downloadSounds(FILE_PATHS, setProgress);
      setCached(FILE_PATHS.length);
    } catch {
      setError("Some sounds didn’t download. Check your connection and try again.");
      countCached(FILE_PATHS).then(setCached);
    } finally {
      setProgress(null);
    }
  };

  const allCached = cached === FILE_PATHS.length;

  return (
    <Sheet open={open} onClose={onClose} title="About Let Me Focus">
      <div className="flex flex-col gap-6 pt-2 pb-2">
        <p className="text-sm text-muted">
          Layer recorded ambience, noise and binaural tones into a soundscape that helps you settle into work. Pair it with
          the focus timer, then open focus mode and put the phone down.
        </p>

        {!env.standalone && (
          <section className="rounded-[6px] border border-line bg-raised p-3">
            <h3 className="label-mono mb-2 text-fg">Install the app</h3>
            {canPrompt ? (
              <button
                type="button"
                onClick={install}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[4px] bg-fg px-4 text-sm font-medium text-bg"
              >
                <Download className="size-4" /> Add to Home Screen
              </button>
            ) : env.ios ? (
              <ol className="flex flex-col gap-2 text-sm text-muted">
                <li className="flex items-center gap-2">
                  <span className="label-mono text-faint">1</span> Tap <Share className="size-4 text-fg" aria-label="Share" /> in
                  Safari’s toolbar
                </li>
                <li className="flex items-center gap-2">
                  <span className="label-mono text-faint">2</span> Choose <SquarePlus className="size-4 text-fg" aria-hidden />
                  <span className="text-fg">Add to Home Screen</span>
                </li>
              </ol>
            ) : (
              <p className="text-sm text-muted">Use your browser’s menu and pick “Install app” or “Add to Home Screen”.</p>
            )}
          </section>
        )}

        <section className="rounded-[6px] border border-line bg-raised p-3">
          <h3 className="label-mono mb-1 flex items-center gap-2 text-fg">
            <WifiOff className="size-3.5" /> Offline sounds
          </h3>
          <p className="mb-3 text-sm text-muted">
            Sounds are saved as you play them. Save all {FILE_PATHS.length} recordings (about 80 MB) to use them anywhere.
            Noise and tones are generated on the device.
          </p>
          {allCached ? (
            <p className="flex items-center gap-2 text-sm text-ok">
              <Check className="size-4" /> All sounds are available offline
            </p>
          ) : (
            <button
              type="button"
              onClick={download}
              disabled={progress !== null}
              className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-[4px] border border-line-strong px-4 font-mono text-xs disabled:cursor-wait"
            >
              <Download className="size-4" />
              {progress !== null
                ? `Saving ${progress} / ${FILE_PATHS.length}`
                : `Save all sounds${cached ? ` (${cached} saved)` : ""}`}
            </button>
          )}
          {progress !== null && (
            <div className="mt-3 h-1 overflow-hidden rounded-full bg-line">
              <div className="h-full bg-brand transition-[width]" style={{ width: `${(progress / FILE_PATHS.length) * 100}%` }} />
            </div>
          )}
          {error && <p className="mt-2 text-xs text-brand-light">{error}</p>}
        </section>

        <section className="max-md:hidden">
          <h3 className="label-mono mb-2">Keyboard</h3>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
            {SHORTCUTS.map(([key, action]) => (
              <div key={key} className="contents">
                <dt>
                  <kbd className="rounded-[3px] border border-line-strong px-1.5 py-0.5 font-mono text-xs">{key}</kbd>
                </dt>
                <dd className="text-muted">{action}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section>
          <h3 className="label-mono mb-2">Credits</h3>
          <p className="text-sm text-muted">
            Recordings come from{" "}
            <a className="text-fg underline underline-offset-2" href="https://github.com/remvze/moodist" target="_blank" rel="noopener">
              Moodist
            </a>{" "}
            by remvze (MIT), whose sounds are under the Pixabay Content License or CC0.
          </p>
        </section>
      </div>
    </Sheet>
  );
}
