import { useParams } from "react-router-dom";
import { drawingLabel, getTopic, topics } from "../content";
import { DrawingCard } from "../features/subjects/DrawingCard";
import { pad } from "../lib/format";
import NotFoundPage from "./NotFoundPage";
import { MockInterview } from "../features/mock-interview/MockInterview";

export default function TopicPage() {
  const topic = getTopic(useParams().topicId);
  if (!topic) return <NotFoundPage />;
  return <TopicSheet topicId={topic.id} />;
}

function TopicSheet({ topicId }: { topicId: string }) {
  const topic = getTopic(topicId)!;
  const sheet = pad(topics.indexOf(topic) + 1);
  const sections = topic.sections
    .map((section, i) => ({ section, number: pad(i + 1), subjects: topic.subjects.filter((s) => s.section === section.id) }))
    .filter((group) => group.subjects.length > 0);

  return (
    <div className={`accent-${topic.accent}`}>
      <div className="th">
        <span className="tag2">SHEET {sheet}</span>
        <h1>{topic.title}</h1>
        <p>{topic.blurb} Choose a drawing to open its notes.</p>
      </div>
      <MockInterview key={topic.id} topic={topic} />
      {sections.map(({ section, number, subjects }) => (
        <section key={section.id} className="sec" aria-labelledby={`sec-${section.id}`}>
          <h2 id={`sec-${section.id}`}>
            <span className="l">{number}</span> {section.title}
          </h2>
          <ul className="dws">
            {subjects.map((s) => (
              <li key={s.id}>
                <DrawingCard subject={s} label={drawingLabel(topic, s)} />
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
