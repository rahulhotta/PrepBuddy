import { AsyncView } from "../../components/AsyncView";
import { loadCaseStudy } from "../../content";
import type { SubjectIndex } from "../../content/schema";
import { pad } from "../../lib/format";
import { useAsync } from "../../lib/useAsync";

export default function CaseStudyView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadCaseStudy(subject), subject.id);

  return (
    <AsyncView state={state}>
      {(cs) => (
        <>
          <h2 className="l" style={{ margin: "0 0 16px", fontWeight: 400 }}>
            {cs.title.toUpperCase()}
          </h2>
          <ol className="steps">
            {cs.steps.map((step, i) => (
              <li key={i}>
                <div className="step">
                  <span className="no" aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                  <span>
                    <span className="step-h">{step.heading}</span>
                    <span className="step-p">{step.body}</span>
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </AsyncView>
  );
}
