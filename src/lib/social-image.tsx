import { ImageResponse } from "next/og";
import { SITE_HOST } from "./site";

const size = { width: 1200, height: 630 };

export const socialImage = (alt: string) => ({ alt, size, contentType: "image/png" });

interface SocialImageProps {
  eyebrow: string;
  title: string;
  detail?: string;
}

/** The shared Open Graph card: near-black, the ring mark, an ember eyebrow and a large title. */
export function SocialImage({ eyebrow, title, detail }: SocialImageProps) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "#0a0a0a",
          color: "#e8e6e3",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
            <circle cx="32" cy="32" r="21" stroke="#e8e6e3" strokeWidth="5" strokeLinecap="round" strokeDasharray="108 24" transform="rotate(-62 32 32)" />
            <circle cx="32" cy="32" r="6.5" fill="#f08a4b" />
          </svg>
          <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#f08a4b" }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: title.length > 32 ? 68 : 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {detail && <div style={{ fontSize: 32, color: "#a29f99" }}>{detail}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#8c8983" }}>
          <span>Free · No sign-up · Works offline</span>
          <span style={{ color: "#e8e6e3" }}>{SITE_HOST}</span>
        </div>
      </div>
    ),
    size,
  );
}
