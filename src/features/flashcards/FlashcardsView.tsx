import { useState } from "react";
import { AsyncView } from "../../components/AsyncView";
import { loadCards } from "../../content";
import type { Card, SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";
import { shuffled } from "../../lib/shuffle";
import { ProgressTicks } from "../progress/ProgressTicks";
import { useProgress } from "../progress/store";

export default function FlashcardsView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadCards(subject), subject.id);
  return <AsyncView state={state}>{(cards) => <Flashcards subjectId={subject.id} cards={cards} />}</AsyncView>;
}

export function Flashcards({
  subjectId,
  cards,
  random = Math.random,
}: {
  subjectId: string;
  cards: Card[];
  random?: () => number;
}) {
  const [order, setOrder] = useState(() => cards.map((_, i) => i));
  const [pos, setPos] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const mastered = useProgress((s) => s.cards[subjectId]);
  const setCardMastered = useProgress((s) => s.setCardMastered);

  if (!cards.length) return <p className="l">NO CARDS YET.</p>;

  const card = cards[order[pos]];
  const masteredCount = cards.filter((c) => mastered?.[c.id]).length;

  const move = (delta: number) => {
    setPos((p) => (p + delta + cards.length) % cards.length);
    setFlipped(false);
  };
  const mark = (ok: boolean) => {
    setCardMastered(subjectId, card.id, ok);
    move(1);
  };
  const shuffle = () => {
    setOrder(shuffled(cards.map((_, i) => i), random));
    setPos(0);
    setFlipped(false);
  };

  return (
    <>
      <p className="l" style={{ textAlign: "center", margin: 0 }} aria-live="polite">
        CARD {pos + 1} OF {cards.length}, MASTERED {masteredCount}
      </p>
      <ProgressTicks done={masteredCount} total={cards.length} center />
      <div className="scene">
        <button
          type="button"
          className={flipped ? "c3d flip" : "c3d"}
          aria-pressed={flipped}
          onClick={() => setFlipped((f) => !f)}
        >
          <span className="face f" aria-hidden={flipped}>
            <span className="l">QUESTION</span>
            <span className="q">{card.front}</span>
            <small>SELECT TO FLIP</small>
          </span>
          <span className="face b" aria-hidden={!flipped}>
            <span className="l">ANSWER</span>
            {card.back}
          </span>
        </button>
      </div>
      <div className="row">
        <button type="button" className="btn o" onClick={() => move(-1)}>
          PREVIOUS
        </button>
        <button type="button" className="btn o" onClick={() => mark(false)}>
          AGAIN
        </button>
        <button type="button" className="btn" onClick={() => mark(true)}>
          GOT IT
        </button>
        <button type="button" className="btn o" onClick={() => move(1)}>
          NEXT
        </button>
        <button type="button" className="btn o" onClick={shuffle}>
          SHUFFLE
        </button>
      </div>
    </>
  );
}
