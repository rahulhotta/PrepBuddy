import { Link } from "react-router-dom";
import { MATERIAL_LABELS } from "../../content/constants";
import type { SubjectIndex } from "../../content/schema";

export function DrawingCard({ subject, label }: { subject: SubjectIndex; label: string }) {
  return (
    <Link className="dw" to={`/${subject.topicId}/${subject.id}`}>
      <span className="l">{label}</span>
      <span className="n2">{subject.title}</span>
      <span className="mu">{subject.tag}</span>
      <span>
        {subject.materials.map((m) => (
          <span key={m} className="chip">
            {MATERIAL_LABELS[m]}
          </span>
        ))}
      </span>
    </Link>
  );
}
