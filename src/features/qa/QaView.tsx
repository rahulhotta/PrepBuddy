import { useState } from "react";
import { AsyncView } from "../../components/AsyncView";
import { ContentMarkdown } from "../../components/ContentMarkdown";
import { loadQa } from "../../content";
import type { QaItem, SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";

export const QA_PAGE_SIZE = 20;

export default function QaView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadQa(subject), subject.id);
  return <AsyncView state={state}>{(items) => <QaList items={items} />}</AsyncView>;
}

export function QaList({ items }: { items: QaItem[] }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(items.length / QA_PAGE_SIZE));
  const visible = items.slice(page * QA_PAGE_SIZE, (page + 1) * QA_PAGE_SIZE);

  return (
    <>
      <p className="l" style={{ margin: "0 0 16px" }}>
        {items.length} QUESTIONS. OPEN A QUESTION TO SEE THE ANSWER.
      </p>
      <ul className="qa">
        {visible.map((q) => (
          <li key={q.id}>
            <details>
              <summary>{q.question}</summary>
              <div className="a">
                <ContentMarkdown>{q.answer}</ContentMarkdown>
              </div>
            </details>
          </li>
        ))}
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
