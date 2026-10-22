import Link from "next/link";
import { CopyUrl } from "@/components/CopyUrl";
import { GuideLayout } from "@/components/GuideLayout";
import { JsonLd, organization } from "@/components/JsonLd";
import {
  MCP_CAPABILITIES,
  MCP_CLIENTS,
  MCP_DESCRIPTION,
  MCP_EXAMPLE_PROMPTS,
  MCP_LIMITS,
  MCP_TITLE,
  MCP_URL,
} from "@/lib/mcp";
import { pageMetadata } from "@/lib/seo";
import { SITE_NAME, SITE_URL, absoluteUrl } from "@/lib/site";

export const metadata = pageMetadata({
  title: MCP_TITLE,
  description: MCP_DESCRIPTION,
  path: "/mcp",
});

/** How to connect an AI assistant to Focuship, and what it can do once connected. */
export default function McpPage() {
  return (
    <GuideLayout>
      <article className="flex max-w-2xl flex-col gap-8 text-[0.9375rem] leading-relaxed text-muted">
        <header>
          <p className="label-mono text-faint">Model Context Protocol</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-fg">{MCP_TITLE}</h1>
          <p className="mt-3">
            Connect {SITE_NAME} to Claude, ChatGPT, Cursor or Claude Code and your assistant becomes a mix designer
            and librarian: describe how you want to feel, and it hands you a link that opens exactly that.
          </p>
        </header>

        <section className="rounded-[18px] border border-[#222] bg-raised p-5">
          <h2 className="label-mono text-faint">Connector URL</h2>
          <CopyUrl url={MCP_URL} />
          <p className="mt-3 text-sm">
            A free {SITE_NAME} account is required, so your assistant works with your own presets and settings. You
            approve it once on a consent screen and can disconnect it at any time from{" "}
            <Link href="/account" className="text-fg underline underline-offset-4">
              your account
            </Link>
            .
          </p>
        </section>

        <Section title="What it can do">
          <ul className="list-disc pl-5">
            {MCP_CAPABILITIES.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Section>

        <Section title="Try asking">
          <ul className="flex flex-col gap-2">
            {MCP_EXAMPLE_PROMPTS.map((prompt) => (
              <li key={prompt} className="rounded-[14px] border border-[#1f1f1f] bg-surface px-4 py-3 text-fg">
                “{prompt}”
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Setting it up">
          <div className="flex flex-col gap-6">
            {MCP_CLIENTS.map((client) => (
              <div key={client.client}>
                <h3 className="font-medium text-fg">{client.client}</h3>
                <ol className="mt-2 list-decimal pl-5">
                  {client.steps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {client.snippet && (
                  <pre className="mt-3 overflow-x-auto rounded-[14px] border border-[#1f1f1f] bg-surface p-4 font-mono text-[0.8125rem] text-fg">
                    <code>{client.snippet.code}</code>
                  </pre>
                )}
              </div>
            ))}
          </div>
        </Section>

        <Section title="What it cannot do">
          <ul className="list-disc pl-5">
            {MCP_LIMITS.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <p>
            What your assistant reads goes to whoever makes it, under their privacy policy. See the{" "}
            <Link href="/privacy" className="text-fg underline underline-offset-4">
              privacy policy
            </Link>{" "}
            for what {SITE_NAME} itself stores.
          </p>
        </Section>
      </article>
      <JsonLd
        nodes={[
          organization(),
          {
            "@type": "WebPage",
            name: MCP_TITLE,
            description: MCP_DESCRIPTION,
            url: absoluteUrl("/mcp"),
            isPartOf: { "@id": `${SITE_URL}/#website` },
          },
        ]}
      />
    </GuideLayout>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-fg">{title}</h2>
      {children}
    </section>
  );
}
