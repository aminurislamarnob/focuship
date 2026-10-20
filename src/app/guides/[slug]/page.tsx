import { notFound } from "next/navigation";
import { GuideArticle } from "@/components/GuideArticle";
import { GUIDES, findGuide, guidePath, isGuideIndexable } from "@/lib/guides";
import { pageMetadata } from "@/lib/seo";
import { AUTHOR } from "@/lib/site";

export const dynamicParams = false;
export const generateStaticParams = () => GUIDES.map((guide) => ({ slug: guide.slug }));

const guideFor = async (params: PageProps<"/guides/[slug]">["params"]) => findGuide((await params).slug) ?? notFound();

export async function generateMetadata({ params }: PageProps<"/guides/[slug]">) {
  const guide = await guideFor(params);
  return {
    ...pageMetadata({ title: guide.title, description: guide.description, path: guidePath(guide), noindex: !isGuideIndexable(guide) }),
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
  };
}

export default async function Page({ params }: PageProps<"/guides/[slug]">) {
  return <GuideArticle guide={await guideFor(params)} />;
}
