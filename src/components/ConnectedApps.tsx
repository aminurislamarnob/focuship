"use client";

import { Bot, Unplug } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { actions } from "@/lib/store";
import type { ConnectedApp } from "@/lib/cloud";
import { getCloud } from "@/lib/focuship-api";
import { MCP_TITLE } from "@/lib/mcp";

/**
 * The AI assistants this listener has let into their account, and the way back out
 * (ADR 0004). Signing out of Focuship deliberately leaves them connected, so this is
 * the only place that cuts one off.
 */
export function ConnectedApps() {
  const [apps, setApps] = useState<ConnectedApp[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    getCloud()
      ?.listConnectedApps()
      .then((list) => live && setApps(list))
      .catch(() => live && setApps([]));
    return () => {
      live = false;
    };
  }, []);

  const revoke = async (app: ConnectedApp) => {
    const cloud = getCloud();
    if (!cloud) return;
    setBusy(app.id);
    try {
      await cloud.revokeConnectedApp(app.id);
      setApps((current) => (current ?? []).filter((a) => a.id !== app.id));
      actions.showNotice(`${app.name} can no longer reach your Focuship library.`);
    } catch (error) {
      actions.showNotice(error instanceof Error ? error.message : "Couldn’t disconnect that app.");
    } finally {
      setBusy(null);
    }
  };

  // Nothing connected and nothing to say yet: the invitation below is enough.
  if (apps === null || apps.length === 0) {
    return (
      <section className="rounded-[18px] border border-[#222] bg-raised p-5">
        <h2 className="flex items-center gap-2 text-sm font-medium text-fg">
          <Bot className="size-4 text-soft" strokeWidth={1.75} aria-hidden /> {MCP_TITLE}
        </h2>
        <p className="mt-2 text-[0.8125rem] leading-normal text-muted">
          Let Claude, ChatGPT or your editor design mixes and manage your presets for you.
        </p>
        <Link
          href="/mcp"
          className="mt-3 inline-flex h-11 items-center justify-center rounded-[14px] border border-line-strong bg-surface-2 px-4 text-sm font-[550] text-fg transition-colors hover:bg-[#222]"
        >
          How to connect one
        </Link>
      </section>
    );
  }

  return (
    <section className="rounded-[18px] border border-[#222] bg-raised p-5">
      <h2 className="flex items-center gap-2 text-sm font-medium text-fg">
        <Bot className="size-4 text-soft" strokeWidth={1.75} aria-hidden /> Connected apps
      </h2>
      <ul className="mt-3 flex flex-col gap-2">
        {apps.map((app) => (
          <li key={app.id} className="flex items-center gap-3 rounded-[14px] border border-edge bg-surface px-4 py-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-fg">{app.name}</p>
              <p className="label-mono mt-0.5 text-faint">
                Connected {shortDate(app.connectedAt)} · last used {shortDate(app.lastUsedAt)}
              </p>
            </div>
            <button
              type="button"
              disabled={busy === app.id}
              onClick={() => revoke(app)}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center gap-2 rounded-[12px] px-3 text-sm font-[550] text-danger transition-colors hover:bg-danger/10 disabled:opacity-40"
            >
              <Unplug className="size-4" strokeWidth={1.75} aria-hidden />
              {busy === app.id ? "Disconnecting…" : "Disconnect"}
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.78rem] leading-normal text-faint">
        A connected app can read and change your presets, favorites and timer settings. It can never delete your
        account. Signing out of Focuship does not disconnect it.
      </p>
    </section>
  );
}

const shortDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString(undefined, { day: "numeric", month: "short" }) : "—";
