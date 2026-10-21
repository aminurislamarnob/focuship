import Link from "next/link";
import { Logo } from "@/components/Logo";
import { GUIDES_HUB } from "@/lib/guides";
import { HUBS } from "@/lib/pages";

export const metadata = { title: "Page not found", robots: { index: false } };

/** The static 404: a short apology and the main ways back in (served as /404.html by the Worker). */
export default function NotFound() {
  return (
    <div className="flex h-dvh flex-col overflow-y-auto">
      <header className="pt-safe border-b border-line">
        <div className="mx-auto flex h-14 max-w-3xl items-center px-4">
          <Link href="/" aria-label="Focuship home">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-4 py-16">
        <p className="label-mono text-faint">404</p>
        <h1 className="mt-2 text-2xl font-semibold">This page doesn&rsquo;t exist</h1>
        <p className="mt-2 max-w-md text-muted">
          The link may be old or mistyped. The mixer, sounds and timers are all still here:
        </p>
        <ul className="mt-6 flex flex-col gap-2">
          {[{ path: "/", label: "Open the app", title: "Ambient sound mixer and focus timer" }, ...HUBS, GUIDES_HUB].map(
            (item) => (
              <li key={item.path}>
                <Link href={item.path} className="text-fg underline underline-offset-4 hover:decoration-fg">
                  {item.label}
                </Link>
                <span className="ml-2 text-sm text-faint">{item.title}</span>
              </li>
            ),
          )}
        </ul>
      </main>
    </div>
  );
}
