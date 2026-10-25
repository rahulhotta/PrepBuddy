import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { SubjectIndex, TopicIndex } from "../../content/schema";

/** subjectId -> itemId -> true. Absent means not done. */
export type Flags = Record<string, Record<string, true>>;

export interface ProgressData {
  cards: Flags;
  qa: Flags;
  steps: Flags;
}

export interface ProgressState extends ProgressData {
  setCardMastered: (subjectId: string, cardId: string, mastered: boolean) => void;
  markQaUnderstood: (subjectId: string, qaId: string) => void;
  toggleStep: (subjectId: string, index: number) => void;
  reset: () => void;
}

export const PROGRESS_STORAGE_KEY = "prepbook-progress";
export const PROGRESS_VERSION = 1;

const empty = (): ProgressData => ({ cards: {}, qa: {}, steps: {} });

function withFlag(flags: Flags, subjectId: string, itemId: string, on: boolean): Flags {
  const current = { ...(flags[subjectId] ?? {}) };
  if (on) current[itemId] = true;
  else delete current[itemId];
  return { ...flags, [subjectId]: current };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set) => ({
      ...empty(),
      setCardMastered: (subjectId, cardId, mastered) =>
        set((s) => ({ cards: withFlag(s.cards, subjectId, cardId, mastered) })),
      markQaUnderstood: (subjectId, qaId) => set((s) => ({ qa: withFlag(s.qa, subjectId, qaId, true) })),
      toggleStep: (subjectId, index) =>
        set((s) => {
          const key = String(index);
          return { steps: withFlag(s.steps, subjectId, key, !s.steps[subjectId]?.[key]) };
        }),
      reset: () => set(empty()),
    }),
    {
      name: PROGRESS_STORAGE_KEY,
      version: PROGRESS_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ cards, qa, steps }) => ({ cards, qa, steps }),
      migrate: (persisted) => ({ ...empty(), ...(persisted as Partial<ProgressData>) }),
    },
  ),
);

const count = (flags: Flags, subjectId: string, max: number) =>
  Math.min(Object.keys(flags[subjectId] ?? {}).length, max);

export interface Tally {
  done: number;
  total: number;
}

export function subjectTally(data: ProgressData, subject: SubjectIndex): Tally {
  const { qa, cards, steps } = subject.counts;
  return {
    done: count(data.qa, subject.id, qa) + count(data.cards, subject.id, cards) + count(data.steps, subject.id, steps),
    total: qa + cards + steps,
  };
}

export function topicTally(data: ProgressData, topic: TopicIndex): Tally {
  return topic.subjects.reduce<Tally>(
    (acc, s) => {
      const t = subjectTally(data, s);
      return { done: acc.done + t.done, total: acc.total + t.total };
    },
    { done: 0, total: 0 },
  );
}

export function useTopicTally(topic: TopicIndex): Tally {
  const cards = useProgress((s) => s.cards);
  const qa = useProgress((s) => s.qa);
  const steps = useProgress((s) => s.steps);
  return topicTally({ cards, qa, steps }, topic);
}
