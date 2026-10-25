import { lazy, Suspense, type ComponentType } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { drawingLabel, getSubject, getTopic, hasMaterial } from "../content";
import { MATERIAL_LABELS, type MaterialSlug } from "../content/constants";
import type { SubjectIndex } from "../content/schema";
import NotFoundPage from "./NotFoundPage";

type ViewProps = { subject: SubjectIndex };

const VIEWS: Record<MaterialSlug, ComponentType<ViewProps>> = {
  qa: lazy(() => import("../features/qa/QaView")),
  flashcards: lazy(() => import("../features/flashcards/FlashcardsView")),
  diagram: lazy(() => import("../features/diagram/DiagramView")),
  explanation: lazy(() => import("../features/subjects/ExplanationView")),
  "case-study": lazy(() => import("../features/case-study/CaseStudyView")),
};

export default function SubjectPage() {
  const { topicId, subjectId, material } = useParams();
  const topic = getTopic(topicId);
  const subject = getSubject(topicId, subjectId);
  if (!topic || !subject) return <NotFoundPage />;
  if (!hasMaterial(subject, material)) {
    return <Navigate to={`/${topic.id}/${subject.id}/${subject.materials[0]}`} replace />;
  }

  const View = VIEWS[material];

  return (
    <div className={`accent-${topic.accent}`}>
      <Link className="back" to={`/${topic.id}`}>
        BACK TO {topic.title.toUpperCase()}
      </Link>
      <div className="l">
        {drawingLabel(topic, subject)} / {subject.tag.toUpperCase()}
      </div>
      <h1 className="st">{subject.title}</h1>
      <nav className="tabs" aria-label="Materials">
        <ul>
          {subject.materials.map((m) => (
            <li key={m}>
              <Link className="tab" to={`/${topic.id}/${subject.id}/${m}`} aria-current={m === material ? "page" : undefined}>
                {MATERIAL_LABELS[m]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <section className="panel" aria-label={MATERIAL_LABELS[material]}>
        <Suspense
          fallback={
            <p className="l" role="status">
              LOADING...
            </p>
          }
        >
          <View key={`${subject.id}/${material}`} subject={subject} />
        </Suspense>
      </section>
    </div>
  );
}
