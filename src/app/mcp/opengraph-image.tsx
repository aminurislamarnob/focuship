import { MCP_TITLE } from "@/lib/mcp";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const { alt, size, contentType } = socialImage(MCP_TITLE);

export default function Image() {
  return SocialImage({
    eyebrow: "Focuship · MCP",
    title: MCP_TITLE,
    detail: "Claude · ChatGPT · Cursor · Claude Code",
  });
}
