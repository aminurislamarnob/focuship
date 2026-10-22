import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage("Use Focuship from your AI assistant");

export default function Image() {
  return SocialImage({
    eyebrow: "Focuship · MCP",
    title: "Use Focuship from your AI assistant",
    detail: "Claude · ChatGPT · Cursor · Claude Code",
  });
}
