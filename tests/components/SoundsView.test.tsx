import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { beforeEach, describe, expect, it } from "vitest";
import { SoundsView } from "@/components/SoundsView";
import { SOUNDS } from "@/lib/catalog";
import { actions } from "@/lib/store";

/** The view with its search box owned by a parent, as the shell does. */
function Library() {
  const [query, setQuery] = useState("");
  return <SoundsView guides={[]} query={query} onQuery={setQuery} />;
}

const pads = () => screen.getAllByRole("button", { name: /, (recording|generated)/ });

describe("SoundsView", () => {
  beforeEach(() => actions.clear());

  it("lists every sound in the library", () => {
    render(<Library />);
    expect(pads()).toHaveLength(SOUNDS.length);
  });

  it("filters by category chip", async () => {
    render(<Library />);
    await userEvent.click(screen.getByRole("button", { name: /^Rain\s*\d+$/ }));
    expect(screen.getByRole("button", { name: /^Rain\s*\d+$/ })).toHaveAttribute("aria-pressed", "true");
    const rain = SOUNDS.filter((s) => s.category === "rain");
    expect(pads()).toHaveLength(rain.length);
  });

  it("searches names and categories, and says so when nothing matches", async () => {
    render(<Library />);
    const search = screen.getAllByRole("searchbox", { name: /Search sounds/ })[0];
    await userEvent.type(search, "rain");
    expect(screen.getByRole("button", { name: /^Light rain,/ })).toBeInTheDocument();
    // Thunder lives in the Rain category, so it matches too.
    expect(screen.getByRole("button", { name: /^Thunder,/ })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /^Campfire,/ })).not.toBeInTheDocument();

    await userEvent.clear(search);
    await userEvent.type(search, "zzzz");
    expect(screen.getByText(/No sounds match/)).toBeInTheDocument();
  });

  it("adds a sound to the mix when its pad is tapped, and shows its volume", async () => {
    render(<Library />);
    const pad = screen.getByRole("button", { name: /^Campfire, recording/ });
    await userEvent.click(pad);
    expect(pad).toHaveAttribute("aria-pressed", "true");
    expect(pad).toHaveAccessibleName(/in mix at 50/);
    expect(within(pad).getByText("50")).toBeInTheDocument();

    await userEvent.click(pad);
    expect(pad).toHaveAttribute("aria-pressed", "false");
  });
});
