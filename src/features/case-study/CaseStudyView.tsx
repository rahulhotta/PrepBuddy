import { AsyncView } from "../../components/AsyncView";
import { loadCaseStudy } from "../../content";
import type { SubjectIndex } from "../../content/schema";
import { pad } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";
import { useProgress } from "../progress/store";

export default function CaseStudyView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadCaseStudy(subject), subject.id);
  const covered = useProgress((s) => s.steps[subject.id]);
  const toggleStep = useProgress((s) => s.toggleStep);

  return (
    <AsyncView state={state}>
      {(cs) => (
        <>
          <h2 className="l" style={{ margin: "0 0 16px", fontWeight: 400 }}>
            {cs.title.toUpperCase()}. SELECT A STEP WHEN YOU CAN EXPLAIN IT OUT LOUD.
          </h2>
          <ol className="steps">
            {cs.steps.map((step, i) => (
              <li key={i}>
                <button
                  type="button"
                  className="step"
                  aria-pressed={Boolean(covered?.[String(i)])}
                  onClick={() => toggleStep(subject.id, i)}
                >
                  <span className="no" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>
                    <span className="step-h">{step.heading}</span>
                    <span className="step-p">{step.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </>
      )}
    </AsyncView>
  );
}
