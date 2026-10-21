import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { Slider, SwapText } from "@/components/ui";

function Volume({ start = 0.5 }: { start?: number }) {
  const [value, setValue] = useState(start);
  return <Slider label="Volume" value={value} onChange={setValue} />;
}

describe("Slider", () => {
  it("is a labelled slider that reports its value as a percentage", () => {
    render(<Volume />);
    const slider = screen.getByRole("slider", { name: "Volume" });
    expect(slider).toHaveAttribute("aria-valuenow", "50");
    expect(slider).toHaveAttribute("aria-valuetext", "50%");
  });

  it("steps with the arrow keys and jumps with Home and End", async () => {
    render(<Volume />);
    const slider = screen.getByRole("slider", { name: "Volume" });
    slider.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(slider).toHaveAttribute("aria-valuenow", "60");
    await userEvent.keyboard("{ArrowDown}");
    expect(slider).toHaveAttribute("aria-valuenow", "55");
    await userEvent.keyboard("{End}");
    expect(slider).toHaveAttribute("aria-valuenow", "100");
    await userEvent.keyboard("{ArrowRight}{Home}");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });
});

describe("SwapText", () => {
  it("swaps text the reader never saw at once, so a loading default can't flash", () => {
    // The shell's .await-state wrapper hides views until saved state has loaded.
    const { rerender } = render(
      <div className="await-state">
        <SwapText text="Pick a soundscape" />
      </div>,
    );
    act(() => {
      rerender(
        <div className="await-state" data-ready>
          <SwapText text="Brown noise" />
        </div>,
      );
    });
    expect(screen.getByText("Brown noise")).toBeInTheDocument();
    expect(screen.queryByText("Pick a soundscape")).not.toBeInTheDocument();
  });
});
