import { topics } from "../content";
import site from "../content/site.json";
import { QuestionOfTheDay } from "../features/topics/QuestionOfTheDay";
import { SheetCard } from "../features/topics/SheetCard";

export default function HomePage() {
  return (
    <>
      <div className="hero">
        <h1>
          {site.headline.before}
          <span className="hl">{site.headline.highlight}</span>
          {site.headline.after}
        </h1>
        <QuestionOfTheDay />
      </div>
      <h2 className="sr-only">Topics</h2>
      <ul className="sheets">
        {topics.map((t, i) => (
          <li key={t.id}>
            <SheetCard topic={t} index={i} />
          </li>
        ))}
      </ul>
    </>
  );
}
