import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TimerView } from "@/components/TimerView";
import { actions } from "@/lib/store";

/** The length shown between a setting's − and + buttons. */
const lengthOf = (label: string) => screen.getByRole("button", { name: `Shorter ${label}` }).nextElementSibling;

describe("TimerView", () => {
  afterEach(() => {
    actions.resetTimer();
    actions.updateTimerSettings({ focus: 25, short: 5, long: 15 });
    actions.setTimerMode("focus");
  });

  it("shows the focus length on the dial", () => {
    render(<TimerView onMix={() => {}} />);
    expect(screen.getByRole("timer")).toHaveAccessibleName("Focus, 25 minutes 0 seconds left");
  });

  it("starts and pauses", async () => {
    render(<TimerView onMix={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Start" }));
    expect(screen.getByRole("button", { name: "Pause" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Pause" }));
    expect(screen.getByRole("button", { name: "Resume" })).toBeInTheDocument();
  });

  it("switches mode from the mode buttons", async () => {
    render(<TimerView onMix={() => {}} />);
    await userEvent.click(screen.getByRole("button", { name: "Short break" }));
    expect(screen.getByRole("button", { name: "Short break" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("timer")).toHaveAccessibleName("Short break, 5 minutes 0 seconds left");
  });

  it("applies a suggested length, and marks it chosen", async () => {
    render(<TimerView onMix={() => {}} />);
    const fifty = screen.getByRole("button", { name: /^50\/10/ });
    await userEvent.click(fifty);
    expect(fifty).toHaveAttribute("aria-pressed", "true");
    expect(lengthOf("focus")).toHaveTextContent("50 min");
    expect(screen.getByRole("timer")).toHaveAccessibleName("Focus, 50 minutes 0 seconds left");
  });

  it("won't step a length below its minimum", async () => {
    render(<TimerView onMix={() => {}} />);
    const shorter = screen.getByRole("button", { name: "Shorter focus" });
    for (let i = 0; i < 5; i++) await userEvent.click(shorter);
    expect(lengthOf("focus")).toHaveTextContent("5 min");
    expect(shorter).toBeDisabled();
  });
});
