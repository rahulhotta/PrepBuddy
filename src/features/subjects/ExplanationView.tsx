import { AsyncView } from "../../components/AsyncView";
import { loadExample, loadNotes } from "../../content";
import type { SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";

export default function ExplanationView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(
    () => Promise.all([loadNotes(subject), loadExample(subject)]).then(([Notes, example]) => ({ Notes, example })),
    subject.id,
  );

  return (
    <AsyncView state={state}>
      {({ Notes, example }) => (
        <div className="ex">
          <Notes />
          {example && (
            <section aria-labelledby="python-example">
              <div className="code-head">
                <h2 id="python-example">Python example</h2>
                <span className="l">{example.path}</span>
              </div>
              {/* Shiki HTML generated at build time from our own example.py, not user input. */}
              <div dangerouslySetInnerHTML={{ __html: example.html }} />
            </section>
          )}
        </div>
      )}
    </AsyncView>
  );
}
