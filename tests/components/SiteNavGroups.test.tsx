import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SiteNavGroups, type SiteGroup } from "@/components/SiteNavGroups";

const nav = vi.hoisted(() => ({ pathname: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

const GROUPS: SiteGroup[] = [
  {
    heading: "Popular",
    links: [
      { href: "/sounds/brown-noise", label: "Brown noise", icon: "brown-noise" },
      { href: "/mix/thunderstorm", label: "Thunderstorm sounds", icon: "thunderstorm" },
    ],
  },
  {
    heading: "Explore",
    links: [
      { href: "/mix", label: "Mixes", icon: "mixes" },
      { href: "/guides", label: "Guides", icon: "guides" },
      { href: "/about", label: "About & offline", icon: "about", kbd: "4" },
    ],
  },
];

const group = (name: string) => screen.getByText(name).closest("details")!;

describe("SiteNavGroups", () => {
  beforeEach(() => {
    nav.pathname = "/";
  });

  it("starts with every group closed", () => {
    render(<SiteNavGroups groups={GROUPS} />);
    expect(group("Popular")).not.toHaveAttribute("open");
    expect(group("Explore")).not.toHaveAttribute("open");
  });

  it("opens the group holding the current page and marks only that link current", () => {
    nav.pathname = "/mix";
    render(<SiteNavGroups groups={GROUPS} />);
    expect(group("Explore")).toHaveAttribute("open");
    expect(group("Popular")).not.toHaveAttribute("open");
    expect(screen.getByRole("link", { name: "Mixes" })).toHaveAttribute("aria-current", "page");
    expect(screen.getAllByRole("link").filter((a) => a.hasAttribute("aria-current"))).toHaveLength(1);
  });

  it("lights a section, without calling it the current page, on a page under it", () => {
    nav.pathname = "/guides/pomodoro-technique";
    render(<SiteNavGroups groups={GROUPS} />);
    expect(group("Explore")).toHaveAttribute("open");
    const guides = screen.getByRole("link", { name: "Guides" });
    expect(guides).not.toHaveAttribute("aria-current");
    expect(guides.className).toContain("bg-[#161616]");
  });

  it("prefers a page's own link over its section", () => {
    nav.pathname = "/mix/thunderstorm";
    render(<SiteNavGroups groups={GROUPS} />);
    expect(group("Popular")).toHaveAttribute("open");
    expect(group("Explore")).not.toHaveAttribute("open");
  });

  it("shows a link's keyboard shortcut", () => {
    render(<SiteNavGroups groups={GROUPS} />);
    expect(screen.getByRole("link", { name: /About & offline/ })).toHaveTextContent("4");
  });

  it("opens and closes a group from its heading", async () => {
    render(<SiteNavGroups groups={GROUPS} />);
    await userEvent.click(screen.getByText("Popular"));
    expect(group("Popular")).toHaveAttribute("open");
  });
});
