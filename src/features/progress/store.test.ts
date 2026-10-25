import { beforeEach, describe, expect, it } from "vitest";
import type { SubjectIndex, TopicIndex } from "../../content/schema";
import { PROGRESS_STORAGE_KEY, subjectTally, topicTally, useProgress } from "./store";

const subject = (id: string, counts: SubjectIndex["counts"]): SubjectIndex => ({
  id,
  topicId: "t",
  title: id,
  tag: "tag",
  section: "s1",
  category: "behavioral",
  order: 1,
  materials: ["qa"],
  example: false,
  status: "placeholder",
  counts,
});

describe("progress store", () => {
  beforeEach(() => useProgress.getState().reset());

  it("marks and unmarks cards", () => {
    const { setCardMastered } = useProgress.getState();
    setCardMastered("strategy", "strategy-card-01", true);
    setCardMastered("strategy", "strategy-card-02", true);
    setCardMastered("strategy", "strategy-card-01", false);
    expect(useProgress.getState().cards).toEqual({ strategy: { "strategy-card-02": true } });
  });

  it("marks Q&A understood and toggles steps", () => {
    const { markQaUnderstood, toggleStep } = useProgress.getState();
    markQaUnderstood("observer", "observer-qa-01");
    toggleStep("parking-lot", 2);
    toggleStep("parking-lot", 3);
    toggleStep("parking-lot", 3);
    const state = useProgress.getState();
    expect(state.qa.observer).toEqual({ "observer-qa-01": true });
    expect(state.steps["parking-lot"]).toEqual({ "2": true });
  });

  it("persists to localStorage with a version", () => {
    useProgress.getState().markQaUnderstood("observer", "observer-qa-02");
    const saved = JSON.parse(localStorage.getItem(PROGRESS_STORAGE_KEY)!);
    expect(saved.version).toBe(1);
    expect(saved.state.qa).toEqual({ observer: { "observer-qa-02": true } });
    expect(saved.state.setCardMastered).toBeUndefined();
  });

  it("rehydrates saved progress", async () => {
    localStorage.setItem(
      PROGRESS_STORAGE_KEY,
      JSON.stringify({ version: 1, state: { cards: { s: { "s-card-01": true } }, qa: {}, steps: {} } }),
    );
    await useProgress.persist.rehydrate();
    expect(useProgress.getState().cards).toEqual({ s: { "s-card-01": true } });
  });

  it("migrates older saved data by filling missing buckets", async () => {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify({ version: 0, state: { qa: { s: { "s-qa-01": true } } } }));
    await useProgress.persist.rehydrate();
    const state = useProgress.getState();
    expect(state.qa).toEqual({ s: { "s-qa-01": true } });
    expect(state.cards).toEqual({});
    expect(state.steps).toEqual({});
  });
});

describe("tallies", () => {
  it("counts done items per subject, capped at the current totals", () => {
    const s = subject("s", { qa: 2, cards: 1, steps: 0 });
    const data = {
      qa: { s: { "s-qa-01": true as const } },
      cards: { s: { "s-card-01": true as const, "s-card-09": true as const } },
      steps: {},
    };
    expect(subjectTally(data, s)).toEqual({ done: 2, total: 3 });
  });

  it("sums subjects into a topic tally", () => {
    const topic = {
      id: "t",
      title: "T",
      blurb: "b",
      accent: "yellow",
      icon: "lld",
      order: 1,
      sections: [{ id: "s1", title: "Section" }],
      subjects: [subject("a", { qa: 1, cards: 0, steps: 0 }), subject("b", { qa: 0, cards: 0, steps: 4 })],
    } satisfies TopicIndex;
    const data = { qa: { a: { "a-qa-01": true as const } }, cards: {}, steps: { b: { "0": true as const } } };
    expect(topicTally(data, topic)).toEqual({ done: 2, total: 5 });
  });
});
