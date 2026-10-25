import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import * as content from "../../content";
import copy from "../../content/mock-interview.json";
import type { SubjectIndex, TopicIndex } from "../../content/schema";
import { InterviewSession, loadInterviewQuestions, MockInterview, type InterviewQuestion } from "./MockInterview";

const subject: SubjectIndex = {
  id: "sample", topicId: "sample-topic", title: "Sample subject", tag: "Concept",
  section: "intro", category: "concept", order: 1, materials: ["qa"], example: false,
  status: "complete", counts: { qa: 1, cards: 0, steps: 0 },
};
const topic: TopicIndex = {
  id: "sample-topic", title: "Sample sheet", blurb: "Test sheet", accent: "yellow",
  icon: "lld", order: 1, sections: [{ id: "intro", title: "Introduction" }], subjects: [subject],
};
const makeQuestions = (count: number): InterviewQuestion[] => Array.from({ length: count }, (_, i) => ({
  subject,
  item: { id: `q-${i}`, question: `Question ${i + 1}?`, answer: `Answer **${i + 1}**.`, difficulty: 1 },
}));
const renderSession = (count: number, random = () => 0.999) =>
  render(<MemoryRouter><InterviewSession questions={makeQuestions(count)} random={random} /></MemoryRouter>);

afterEach(() => vi.restoreAllMocks());

describe("InterviewSession", () => {
  it("shuffles existing questions, reveals Markdown answers, and hides the next answer", async () => {
    const user = userEvent.setup();
    renderSession(3, () => 0);
    expect(screen.getByRole("heading", { name: "Question 2?" })).toHaveFocus();
    expect(screen.queryByRole("region", { name: copy.answer })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.reveal }));
    const answer = screen.getByRole("region", { name: copy.answer });
    expect(within(answer).getByText("2", { selector: "strong" })).toBeInTheDocument();
    expect(within(answer).getByRole("link")).toHaveAttribute("href", "/sample-topic/sample/qa");
    await user.click(screen.getByRole("button", { name: copy.hide }));
    expect(screen.queryByRole("region", { name: copy.answer })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.reveal }));
    await user.click(screen.getByRole("button", { name: copy.next }));
    expect(screen.getByRole("heading", { name: "Question 3?" })).toHaveFocus();
    expect(screen.queryByRole("region", { name: copy.answer })).not.toBeInTheDocument();
  });

  it("pauses after each set of ten and exhausts the pool without repeats", async () => {
    const user = userEvent.setup();
    renderSession(23);
    const visited: string[] = [];
    for (let i = 0; i < 23; i++) {
      visited.push(screen.getByRole("heading", { level: 3 }).textContent!);
      const endOfSet = (i + 1) % 10 === 0 || i === 22;
      await user.click(screen.getByRole("button", { name: endOfSet ? copy.finishSet : copy.next }));
      if (endOfSet && i < 22) {
        expect(screen.getByRole("heading", { name: copy.setComplete })).toHaveFocus();
        expect(screen.getByText(copy.continuePrompt)).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: copy.next })).not.toBeInTheDocument();
        await user.click(screen.getByRole("button", { name: copy.continue }));
      }
    }
    expect(new Set(visited).size).toBe(23);
    expect(screen.getByRole("heading", { name: copy.complete })).toHaveFocus();
    expect(screen.getByText(`${copy.reviewed}: 23. ${copy.remaining}: 0.`)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.continue })).not.toBeInTheDocument();
    expect(localStorage.length).toBe(0);
  });

  it.each([1, 10])("finishes a pool of %i without offering another set", async (count) => {
    const user = userEvent.setup();
    renderSession(count);
    for (let i = 0; i < count - 1; i++) await user.click(screen.getByRole("button", { name: copy.next }));
    await user.click(screen.getByRole("button", { name: copy.finishSet }));
    expect(screen.getByRole("heading", { name: copy.complete })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.continue })).not.toBeInTheDocument();
  });

  it("explains an empty pool without showing question controls", () => {
    renderSession(0);
    expect(screen.getByRole("status")).toHaveTextContent(copy.empty);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});

describe("MockInterview", () => {
  it("loads only this sheet's subjects with Q&A", async () => {
    const questions = makeQuestions(2);
    const otherSubject = { ...subject, id: "other", counts: { qa: 1, cards: 0, steps: 0 } };
    const noQa = { ...subject, id: "no-qa", counts: { qa: 0, cards: 0, steps: 0 } };
    const load = vi.spyOn(content, "loadQa")
      .mockResolvedValueOnce([questions[0].item]).mockResolvedValueOnce([questions[1].item]);
    const result = await loadInterviewQuestions({ ...topic, subjects: [subject, noQa, otherSubject] });
    expect(load.mock.calls).toEqual([[subject], [otherSubject]]);
    expect(result).toEqual([
      { subject, item: questions[0].item },
      { subject: otherSubject, item: questions[1].item },
    ]);
  });

  it("loads on start, supports ending at a set boundary, and starts a fresh session", async () => {
    const user = userEvent.setup();
    const load = vi.spyOn(content, "loadQa").mockResolvedValue(makeQuestions(11).map((q) => q.item));
    render(<MemoryRouter><MockInterview topic={topic} /></MemoryRouter>);
    expect(load).not.toHaveBeenCalled();
    await user.click(screen.getByRole("button", { name: copy.start }));
    await screen.findByRole("button", { name: copy.reveal });
    for (let i = 0; i < 9; i++) await user.click(screen.getByRole("button", { name: copy.next }));
    await user.click(screen.getByRole("button", { name: copy.finishSet }));
    await user.click(screen.getByRole("button", { name: copy.stop }));
    expect(screen.getByRole("button", { name: copy.start })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: copy.continue })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: copy.start }));
    await screen.findByRole("button", { name: copy.reveal });
    expect(screen.getByText("Set 1 / Question 1 of 10")).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("reports a loading error instead of starting an incomplete interview", async () => {
    const user = userEvent.setup();
    vi.spyOn(content, "loadQa").mockRejectedValue(new Error("Questions unavailable"));
    render(<MemoryRouter><MockInterview topic={topic} /></MemoryRouter>);
    await user.click(screen.getByRole("button", { name: copy.start }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Questions unavailable");
    expect(screen.queryByRole("button", { name: copy.reveal })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: copy.stop })).toBeInTheDocument();
  });
});
