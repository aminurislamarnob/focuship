import { notFound } from "next/navigation";
import { GUIDES, findGuide } from "@/lib/guides";
import { SocialImage, socialImage } from "@/lib/social-image";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((guide) => ({ slug: guide.slug }));
export const { alt, size, contentType } = socialImage("A Focuship guide");

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const guide = findGuide((await params).slug) ?? notFound();
  return SocialImage({ eyebrow: "Guide", title: guide.heading });
}
