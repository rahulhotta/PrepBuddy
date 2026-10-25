import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { Card } from "../../content/schema";
import { Flashcards } from "./FlashcardsView";

const cards: Card[] = [
  { id: "s-card-01", front: "First front", back: "First back" },
  { id: "s-card-02", front: "Second front", back: "Second back" },
  { id: "s-card-03", front: "Third front", back: "Third back" },
];

const flipButton = () => screen.getAllByRole("button").find((b) => b.hasAttribute("aria-pressed"))!;

describe("Flashcards", () => {
  it("shows the first question and flips to the answer", async () => {
    const user = userEvent.setup();
    render(<Flashcards cards={cards} />);
    expect(screen.getByText("CARD 1 OF 3")).toBeInTheDocument();
    const card = flipButton();
    expect(card).toHaveTextContent("First front");
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(card).toHaveClass("flip");
  });

  it("supports keyboard flipping", async () => {
    const user = userEvent.setup();
    render(<Flashcards cards={cards} />);
    flipButton().focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { pressed: true })).toHaveClass("flip");
  });

  it("has navigation without mastery controls or saved state", async () => {
    const user = userEvent.setup();
    render(<Flashcards cards={cards} />);
    expect(screen.queryByRole("button", { name: "GOT IT" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "AGAIN" })).not.toBeInTheDocument();
    expect(screen.queryByText(/MASTERED/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "NEXT" }));
    expect(screen.getByText("CARD 2 OF 3")).toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it("wraps around with NEXT and PREVIOUS and resets the flip", async () => {
    const user = userEvent.setup();
    render(<Flashcards cards={cards} />);
    await user.click(screen.getByRole("button", { name: "PREVIOUS" }));
    expect(screen.getByText("CARD 3 OF 3")).toBeInTheDocument();
    await user.click(flipButton());
    await user.click(screen.getByRole("button", { name: "NEXT" }));
    expect(screen.getByText("CARD 1 OF 3")).toBeInTheDocument();
    expect(flipButton()).toHaveAttribute("aria-pressed", "false");
  });

  it("SHUFFLE reorders cards and resets position and flip", async () => {
    const user = userEvent.setup();
    // random() = 0 always swaps with index 0: [0,1,2] -> [1,2,0]
    render(<Flashcards cards={cards} random={() => 0} />);
    await user.click(screen.getByRole("button", { name: "NEXT" }));
    await user.click(flipButton());
    await user.click(screen.getByRole("button", { name: "SHUFFLE" }));
    expect(flipButton()).toHaveTextContent("Second front");
    expect(screen.getByText("CARD 1 OF 3")).toBeInTheDocument();
    expect(flipButton()).toHaveAttribute("aria-pressed", "false");
  });

  it("handles an empty deck", () => {
    render(<Flashcards cards={[]} />);
    expect(screen.getByText("NO CARDS YET.")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
