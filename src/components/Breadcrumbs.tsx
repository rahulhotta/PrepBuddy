import { Link, useParams } from "react-router-dom";
import { getSubject, getTopic } from "../content";

export function Breadcrumbs() {
  const { topicId, subjectId } = useParams();
  const topic = getTopic(topicId);
  const subject = getSubject(topicId, subjectId);

  return (
    <nav className="l crumbs" aria-label="Breadcrumb">
      <ol>
        <li>{topic ? <Link to="/">INDEX</Link> : <span aria-current="page">INDEX</span>}</li>
        {topic && (
          <li>
            {subject ? (
              <Link to={`/${topic.id}`}>{topic.title.toUpperCase()}</Link>
            ) : (
              <span aria-current="page">{topic.title.toUpperCase()}</span>
            )}
          </li>
        )}
        {topic && subject && (
          <li>
            <span aria-current="page">{subject.title.toUpperCase()}</span>
          </li>
        )}
      </ol>
    </nav>
  );
}
