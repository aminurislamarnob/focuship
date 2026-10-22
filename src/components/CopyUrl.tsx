"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

/** A URL to copy: shown in full, one tap to take it. */
export function CopyUrl({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard denied: the address is on screen and selectable anyway.
    }
  };

  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 truncate rounded-[12px] border border-edge bg-[#0e0e0e] px-3.5 py-2.5 font-mono text-xs text-soft select-all">
        {url}
      </code>
      <button
        type="button"
        onClick={copy}
        className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-edge bg-surface px-4 text-sm font-[550] text-fg hover:bg-[#1c1c1c]"
      >
        {copied ? (
          <Check className="size-[18px] animate-pop-in" aria-hidden />
        ) : (
          <Link2 className="size-[18px]" strokeWidth={1.75} aria-hidden />
        )}
        {copied ? "Copied" : "Copy"}
      </button>
      <span role="status" className="sr-only">
        {copied ? "Connector URL copied" : ""}
      </span>
    </div>
  );
}
