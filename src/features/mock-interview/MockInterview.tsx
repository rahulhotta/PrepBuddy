import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AsyncView } from "../../components/AsyncView";
import { ContentMarkdown } from "../../components/ContentMarkdown";
import { loadQa } from "../../content";
import copy from "../../content/mock-interview.json";
import type { QaItem, SubjectIndex, TopicIndex } from "../../content/schema";
import { shuffled } from "../../lib/shuffle";
import { useAsync } from "../../lib/useAsync";

export interface InterviewQuestion {
  subject: SubjectIndex;
  item: QaItem;
}

const SET_SIZE = 10;

export async function loadInterviewQuestions(topic: TopicIndex): Promise<InterviewQuestion[]> {
  const groups = await Promise.all(
    topic.subjects.filter((subject) => subject.counts.qa > 0).map(async (subject) =>
      (await loadQa(subject)).map((item) => ({ subject, item })),
    ),
  );
  return groups.flat();
}

export function MockInterview({ topic }: { topic: TopicIndex }) {
  const [started, setStarted] = useState(false);
  const startButton = useRef<HTMLButtonElement>(null);
  const stop = () => {
    setStarted(false);
    requestAnimationFrame(() => startButton.current?.focus());
  };

  return (
    <section className="sec mock-interview" aria-labelledby="interview-title">
      <h2 id="interview-title">{copy.title}</h2>
      {started ? (
        <>
          <InterviewLoader key={topic.id} topic={topic} />
          <button type="button" className="btn o" onClick={stop}>{copy.stop}</button>
        </>
      ) : (
        <>
          <p>{copy.intro}</p>
          <button type="button" className="btn" ref={startButton} onClick={() => setStarted(true)}>
            {copy.start}
          </button>
        </>
      )}
    </section>
  );
}

function InterviewLoader({ topic }: { topic: TopicIndex }) {
  const state = useAsync(() => loadInterviewQuestions(topic), topic.id);
  return <AsyncView state={state}>{(questions) => <InterviewSession questions={questions} />}</AsyncView>;
}

export function InterviewSession({
  questions,
  random = Math.random,
}: {
  questions: InterviewQuestion[];
  random?: () => number;
}) {
  const [order] = useState(() => shuffled(questions, random));
  const [position, setPosition] = useState(0);
  const [shown, setShown] = useState(false);
  const [phase, setPhase] = useState<"question" | "break" | "complete">("question");
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    heading.current?.focus();
  }, [position, phase]);

  if (!order.length) return <p role="status">{copy.empty}</p>;

  const current = order[position];
  const setNumber = Math.floor(position / SET_SIZE) + 1;
  const setEnd = Math.min(setNumber * SET_SIZE, order.length);
  const lastInSet = position + 1 === setEnd;
  const visited = position + 1;

  const next = () => {
    setShown(false);
    if (visited === order.length) setPhase("complete");
    else if (lastInSet) setPhase("break");
    else setPosition((p) => p + 1);
  };

  if (phase !== "question") {
    return (
      <div className="panel">
        <h3 ref={heading} tabIndex={-1}>{phase === "complete" ? copy.complete : copy.setComplete}</h3>
        <p>{copy.reviewed}: {visited}. {copy.remaining}: {order.length - visited}.</p>
        <p>{phase === "complete" ? copy.completeMessage : copy.continuePrompt}</p>
        {phase === "break" && (
          <button type="button" className="btn" onClick={() => {
            setPosition((p) => p + 1);
            setPhase("question");
          }}>
            {copy.continue}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="panel ex">
      <p className="l">
        {copy.set} {setNumber} / {copy.question} {position % SET_SIZE + 1} {copy.of} {setEnd - (setNumber - 1) * SET_SIZE}
      </p>
      <p className="l">{current.subject.title}</p>
      <h3 ref={heading} tabIndex={-1}>{current.item.question}</h3>
      <button type="button" className="btn" aria-expanded={shown} aria-controls="interview-answer" onClick={() => setShown((value) => !value)}>
        {shown ? copy.hide : copy.reveal}
      </button>
      {shown && (
        <section id="interview-answer" aria-label={copy.answer}>
          <ContentMarkdown>{current.item.answer}</ContentMarkdown>
          <Link to={`/${current.subject.topicId}/${current.subject.id}/qa`}>{current.subject.title}</Link>
        </section>
      )}
      <div>
        <button type="button" className="btn o" onClick={next}>
          {lastInSet ? copy.finishSet : copy.next}
        </button>
      </div>
    </div>
  );
}
