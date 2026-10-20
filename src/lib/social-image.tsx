import { ImageResponse } from "next/og";

const size = { width: 1200, height: 630 };

export const socialImage = (alt: string) => ({ alt, size, contentType: "image/png" });

interface SocialImageProps {
  eyebrow: string;
  title: string;
  detail?: string;
}

/** The shared Open Graph card: near-black, the bracket mark, an orange eyebrow and a large title. */
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
          color: "#ededed",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 100 100">
            <path d="M22 36V22h14 M64 22h14v14 M78 64v14H64 M36 78H22V64" fill="none" stroke="#d25611" strokeWidth="8" />
            <rect x="35" y="44" width="7" height="22" fill="#ededed" />
            <rect x="46.5" y="34" width="7" height="32" fill="#ededed" />
            <rect x="58" y="50" width="7" height="16" fill="#ededed" />
          </svg>
          <div style={{ fontSize: 28, letterSpacing: 6, textTransform: "uppercase", color: "#d25611" }}>{eyebrow}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: title.length > 32 ? 68 : 84, fontWeight: 600, lineHeight: 1.05, letterSpacing: -2 }}>
            {title}
          </div>
          {detail && <div style={{ fontSize: 32, color: "#8f8f8f" }}>{detail}</div>}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 26, color: "#6b6b6b" }}>
          <span>Free · No sign-up · Works offline</span>
          <span style={{ color: "#ededed" }}>focuship.app</span>
        </div>
      </div>
    ),
    size,
  );
}
