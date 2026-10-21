import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MixSheet } from "@/components/MixSheet";
import { PRESETS } from "@/lib/catalog";
import { actions } from "@/lib/store";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/" }));

const rainyDesk = PRESETS.find((p) => p.id === "rainy-desk")!;
const shownLink = () => screen.getByText(/^localhost(:\d+)?\//).textContent;

describe("MixSheet", () => {
  beforeEach(() => actions.clear());

  it("shows the readable link it will copy: a preset's own page", () => {
    actions.applyPreset(rainyDesk.layers, rainyDesk.id);
    render(<MixSheet open onClose={() => {}} />);
    expect(screen.getByRole("dialog")).toHaveAccessibleName(/this mix/);
    expect(shownLink()).toMatch(/\/mix\/rainy-desk$/);
  });

  it("spells out a custom mix", () => {
    actions.applyPreset({ campfire: 0.35, crickets: 0.7 });
    render(<MixSheet open onClose={() => {}} />);
    expect(shownLink()).toMatch(/\/\?mix=campfire:35,crickets:70$/);
  });

  it("lists each sound in the mix with its volume", () => {
    actions.applyPreset({ campfire: 0.35, crickets: 0.7 });
    render(<MixSheet open onClose={() => {}} />);
    expect(screen.getByText("Campfire").parentElement).toHaveTextContent("35");
    expect(screen.getByText("Crickets").parentElement).toHaveTextContent("70");
  });

  it("copies the link and confirms it", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    actions.applyPreset(rainyDesk.layers, rainyDesk.id);
    render(<MixSheet open onClose={() => {}} />);
    await user.click(screen.getByRole("button", { name: /Copy link/ }));
    expect(writeText).toHaveBeenCalledWith(expect.stringMatching(/\/mix\/rainy-desk$/));
    expect(await screen.findByRole("button", { name: /Copied/ })).toBeInTheDocument();
  });

  it("clears the mix and closes", async () => {
    const onClose = vi.fn();
    actions.applyPreset({ campfire: 0.35 });
    render(<MixSheet open onClose={onClose} />);
    await userEvent.click(screen.getByRole("button", { name: /Clear all sounds/ }));
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on Escape", async () => {
    const onClose = vi.fn();
    actions.applyPreset({ campfire: 0.35 });
    render(<MixSheet open onClose={onClose} />);
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });
});
