import { Link } from "react-router-dom";
import { LineIcon } from "../../components/LineIcon";
import type { TopicIndex } from "../../content/schema";
import { pad } from "../../lib/format";

export function SheetCard({ topic, index }: { topic: TopicIndex; index: number }) {
  return (
    <Link className={`s accent-${topic.accent}`} to={`/${topic.id}`}>
      <span className="tag">SHEET {pad(index + 1)}</span>
      <LineIcon icon={topic.icon} />
      <span className="n">{topic.title}</span>
      <span className="i">
        {topic.subjects.slice(0, 6).map((s) => (
          <span key={s.id}>{s.title}</span>
        ))}
        {topic.subjects.length > 6 && <span>and {topic.subjects.length - 6} more</span>}
      </span>
    </Link>
  );
}
