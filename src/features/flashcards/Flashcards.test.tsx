import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import type { Card } from "../../content/schema";
import { useProgress } from "../progress/store";
import { Flashcards } from "./FlashcardsView";

const cards: Card[] = [
  { id: "s-card-01", front: "First front", back: "First back" },
  { id: "s-card-02", front: "Second front", back: "Second back" },
  { id: "s-card-03", front: "Third front", back: "Third back" },
];

const flipButton = () => screen.getAllByRole("button").find((b) => b.hasAttribute("aria-pressed"))!;

describe("Flashcards", () => {
  beforeEach(() => useProgress.getState().reset());

  it("shows the first question and flips to the answer", async () => {
    const user = userEvent.setup();
    render(<Flashcards subjectId="s" cards={cards} />);
    expect(screen.getByText("CARD 1 OF 3, MASTERED 0")).toBeInTheDocument();
    const card = flipButton();
    expect(card).toHaveTextContent("First front");
    await user.click(card);
    expect(card).toHaveAttribute("aria-pressed", "true");
    expect(card).toHaveClass("flip");
  });

  it("supports keyboard flipping", async () => {
    const user = userEvent.setup();
    render(<Flashcards subjectId="s" cards={cards} />);
    flipButton().focus();
    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { pressed: true })).toHaveClass("flip");
  });

  it("GOT IT marks the card mastered and advances; AGAIN unmarks", async () => {
    const user = userEvent.setup();
    render(<Flashcards subjectId="s" cards={cards} />);
    await user.click(screen.getByRole("button", { name: "GOT IT" }));
    expect(useProgress.getState().cards.s).toEqual({ "s-card-01": true });
    expect(screen.getByText("CARD 2 OF 3, MASTERED 1")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "PREVIOUS" }));
    await user.click(screen.getByRole("button", { name: "AGAIN" }));
    expect(useProgress.getState().cards.s).toEqual({});
  });

  it("wraps around with NEXT and PREVIOUS and resets the flip", async () => {
    const user = userEvent.setup();
    render(<Flashcards subjectId="s" cards={cards} />);
    await user.click(screen.getByRole("button", { name: "PREVIOUS" }));
    expect(screen.getByText("CARD 3 OF 3, MASTERED 0")).toBeInTheDocument();
    await user.click(flipButton());
    await user.click(screen.getByRole("button", { name: "NEXT" }));
    expect(screen.getByText("CARD 1 OF 3, MASTERED 0")).toBeInTheDocument();
    expect(flipButton()).toHaveAttribute("aria-pressed", "false");
  });

  it("SHUFFLE reorders cards without touching saved progress", async () => {
    const user = userEvent.setup();
    useProgress.getState().setCardMastered("s", "s-card-02", true);
    // random() = 0 always swaps with index 0: [0,1,2] -> [1,2,0]
    render(<Flashcards subjectId="s" cards={cards} random={() => 0} />);
    await user.click(screen.getByRole("button", { name: "SHUFFLE" }));
    expect(flipButton()).toHaveTextContent("Second front");
    expect(useProgress.getState().cards.s).toEqual({ "s-card-02": true });
  });

  it("shows mastered count from persisted progress", () => {
    useProgress.getState().setCardMastered("s", "s-card-03", true);
    render(<Flashcards subjectId="s" cards={cards} />);
    expect(screen.getByText("CARD 1 OF 3, MASTERED 1")).toBeInTheDocument();
  });
});
