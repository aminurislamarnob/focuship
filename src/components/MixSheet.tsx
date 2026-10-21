"use client";

import { Check, Link2, Share, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { SOUND_BY_ID } from "@/lib/catalog";
import { actions, mixName, shareUrl, useFocus } from "@/lib/store";
import { CLOUD_ENABLED } from "@/lib/supabase";
import { inputClass } from "./MixView";
import { Sheet, cx, useCopied } from "./ui";

const noSubscribe = () => () => {};
const canShareNatively = () => typeof navigator.share === "function";

const secondary =
  "inline-flex h-[52px] cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-line-strong bg-surface-2 text-[0.9375rem] font-[550] transition-colors hover:bg-[#222]";

/** Save the current mix as a preset, share it as a link, or clear it. */
export function MixSheet({ open, onClose }: { open: boolean; onClose(): void }) {
  const router = useRouter();
  const layers = useFocus((s) => s.layers);
  const user = useFocus((s) => s.account.user);
  const [label, setLabel] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, flagCopied] = useCopied();
  const nativeShare = useSyncExternalStore(noSubscribe, canShareNatively, () => false);
  const ids = Object.keys(layers);
  const name = ids.length ? mixName(layers) : "";
  const ready = label.trim().length > 0;
  // Only while open: it reads location, which the prerender doesn't have.
  const link = open && ids.length > 0 ? shareUrl() : "";

  useEffect(() => {
    if (open && ids.length === 0) onClose();
  }, [open, ids.length, onClose]);

  const save = () => {
    if (!ready) return;
    if (!user) {
      router.push("/account?reason=save");
      return;
    }
    if (actions.saveCurrentPreset(label)) {
      setSaved(true);
      setLabel("");
    }
  };

  const copy = () =>
    navigator.clipboard
      .writeText(link)
      .then(flagCopied)
      .catch(() => actions.showNotice("Couldn’t copy the link."));

  const share = () =>
    navigator.share({ title: `${name} · Focuship`, text: `Listen to “${name}” on Focuship`, url: link }).catch((e: Error) => {
      if (e.name !== "AbortError") actions.showNotice("Couldn’t share this mix.");
    });

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={CLOUD_ENABLED ? "Save this mix" : "Share this mix"}
      subtitle={name && `${name} · ${ids.length} sound${ids.length === 1 ? "" : "s"}`}
    >
      <ul className="flex flex-wrap gap-1.5">
        {ids.map((id) => (
          <li key={id} className="inline-flex h-8 items-center gap-2 rounded-full bg-surface-2 px-3 text-[0.8125rem]">
            {SOUND_BY_ID.get(id)?.label ?? id}
            <span className="font-mono text-[0.6875rem] text-muted">{Math.round(layers[id] * 100)}</span>
          </li>
        ))}
      </ul>

      {CLOUD_ENABLED && (
        <form
          className="mt-5 flex flex-col"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <label htmlFor="preset-name" className="text-[0.8125rem] font-medium text-soft">
            Preset name
          </label>
          <div className="mt-2 flex gap-2">
            <input
              id="preset-name"
              value={label}
              onChange={(e) => {
                setLabel(e.target.value);
                setSaved(false);
              }}
              placeholder={name ? `${name}, my way` : "My mix"}
              maxLength={60}
              autoComplete="off"
              className={inputClass}
            />
            <button
              type="submit"
              className={cx(
                "h-[52px] shrink-0 cursor-pointer rounded-[14px] px-[18px] text-[0.9375rem] font-semibold transition-colors",
                ready ? "bg-accent text-accent-ink" : "bg-edge text-muted",
              )}
            >
              {saved ? "Saved" : "Save preset"}
            </button>
          </div>
          <p className="mt-2.5 text-[0.78rem] leading-normal text-faint">
            Saved presets live in your account and sync across your signed-in devices.
            {!user && (
              <>
                {" "}
                <Link href="/account?reason=save" className="text-fg underline underline-offset-2">
                  Sign in
                </Link>
              </>
            )}
          </p>
        </form>
      )}

      <div className={cx("flex flex-col gap-1", CLOUD_ENABLED ? "mt-[22px] border-t border-edge pt-[18px]" : "mt-5")}>
        <h3 className="text-[0.9375rem] font-semibold">Share mix</h3>
        <p className="text-[0.8125rem] text-muted">Anyone with the link hears this exact mix.</p>
      </div>
      <p className="mt-3 truncate rounded-[12px] border border-edge bg-[#0e0e0e] px-3.5 py-2.5 font-mono text-xs text-soft select-all">
        {link.replace(/^https?:\/\//, "")}
      </p>
      <div className={cx("mt-3 grid gap-2", nativeShare && "grid-cols-2")}>
        <button type="button" onClick={copy} className={secondary}>
          {copied ? <Check className="size-[18px] animate-pop-in" aria-hidden /> : <Link2 className="size-[18px]" strokeWidth={1.75} aria-hidden />}
          {copied ? "Copied" : "Copy link"}
        </button>
        {nativeShare && (
          <button type="button" onClick={share} className={secondary}>
            <Share className="size-[18px]" strokeWidth={1.75} aria-hidden /> Share…
          </button>
        )}
      </div>
      <span role="status" className="sr-only">
        {copied ? "Link copied" : ""}
      </span>

      <button
        type="button"
        onClick={() => {
          actions.clear();
          onClose();
        }}
        className="mt-3.5 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-[14px] text-[0.9375rem] font-[550] text-danger"
      >
        <Trash2 className="size-[18px]" strokeWidth={1.75} aria-hidden /> Clear all sounds
      </button>
    </Sheet>
  );
}
