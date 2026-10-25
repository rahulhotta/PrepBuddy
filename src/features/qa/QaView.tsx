import { useState } from "react";
import { AsyncView } from "../../components/AsyncView";
import { ContentMarkdown } from "../../components/ContentMarkdown";
import { loadQa } from "../../content";
import type { QaItem, SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";
import { useProgress } from "../progress/store";

export const QA_PAGE_SIZE = 20;

export default function QaView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadQa(subject), subject.id);
  return <AsyncView state={state}>{(items) => <QaList subjectId={subject.id} items={items} />}</AsyncView>;
}

export function QaList({ subjectId, items }: { subjectId: string; items: QaItem[] }) {
  const [page, setPage] = useState(0);
  const understood = useProgress((s) => s.qa[subjectId]);
  const markQaUnderstood = useProgress((s) => s.markQaUnderstood);
  const pages = Math.max(1, Math.ceil(items.length / QA_PAGE_SIZE));
  const visible = items.slice(page * QA_PAGE_SIZE, (page + 1) * QA_PAGE_SIZE);
  const done = items.filter((q) => understood?.[q.id]).length;

  return (
    <>
      <p className="l" style={{ margin: "0 0 16px" }}>
        {items.length} QUESTIONS, {done} UNDERSTOOD. OPEN A QUESTION TO SEE THE ANSWER.
      </p>
      <ul className="qa">
        {visible.map((q) => {
          const isDone = Boolean(understood?.[q.id]);
          return (
            <li key={q.id}>
              <details>
                <summary>{q.question}</summary>
                <div className="a">
                  <ContentMarkdown>{q.answer}</ContentMarkdown>
                  <button
                    type="button"
                    className="btn"
                    disabled={isDone}
                    onClick={() => markQaUnderstood(subjectId, q.id)}
                  >
                    {isDone ? "UNDERSTOOD" : "MARK UNDERSTOOD"}
                  </button>
                </div>
              </details>
            </li>
          );
        })}
      </ul>
      {pages > 1 && (
        <nav className="pager" aria-label="Question pages">
          <button type="button" className="btn o" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            PREVIOUS PAGE
          </button>
          <span className="l" aria-live="polite">
            PAGE {page + 1} OF {pages}
          </span>
          <button type="button" className="btn o" disabled={page === pages - 1} onClick={() => setPage((p) => p + 1)}>
            NEXT PAGE
          </button>
        </nav>
      )}
    </>
  );
}
