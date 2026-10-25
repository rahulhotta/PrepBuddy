import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AsyncView } from "../../components/AsyncView";
import { ContentMarkdown } from "../../components/ContentMarkdown";
import { loadQa, topics } from "../../content";
import type { SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";

interface Pick {
  subject: SubjectIndex;
  index: number;
}

const DAY_MS = 86_400_000;

function pickAt(pool: SubjectIndex[], n: number): Pick | null {
  const total = pool.reduce((sum, s) => sum + s.counts.qa, 0);
  if (!total) return null;
  let i = ((n % total) + total) % total;
  for (const subject of pool) {
    if (i < subject.counts.qa) return { subject, index: i };
    i -= subject.counts.qa;
  }
  return null;
}

export function QuestionOfTheDay() {
  const pool = useMemo(() => topics.flatMap((t) => t.subjects).filter((s) => s.counts.qa > 0), []);
  const total = pool.reduce((sum, s) => sum + s.counts.qa, 0);
  const [n, setN] = useState(() => Math.floor(Date.now() / DAY_MS));
  const [shown, setShown] = useState(false);
  const pick = pickAt(pool, n);
  const state = useAsync(() => (pick ? loadQa(pick.subject) : Promise.resolve([])), pick ? `${pick.subject.id}` : "none");

  if (!pick) return null;

  const another = () => {
    if (total > 1) setN((prev) => prev + 1 + Math.floor(Math.random() * (total - 1)));
    setShown(false);
  };

  return (
    <aside className="note" aria-labelledby="qotd-label">
      <b id="qotd-label">NOTE 1, QUESTION OF THE DAY</b>
      <AsyncView state={state}>
        {(items) => {
          const item = items[pick.index];
          if (!item) return null;
          return (
            <>
              <span aria-live="polite">{item.question}</span>
              {shown && (
                <div className="ans" id="qotd-answer">
                  <ContentMarkdown>{item.answer}</ContentMarkdown>
                  <Link to={`/${pick.subject.topicId}/${pick.subject.id}/qa`}>Open {pick.subject.title}</Link>
                </div>
              )}
            </>
          );
        }}
      </AsyncView>
      <div>
        <button type="button" className="btn" aria-expanded={shown} onClick={() => setShown((v) => !v)}>
          {shown ? "HIDE" : "REVEAL"}
        </button>
        <button type="button" className="btn o" onClick={another}>
          ANOTHER
        </button>
      </div>
    </aside>
  );
}
