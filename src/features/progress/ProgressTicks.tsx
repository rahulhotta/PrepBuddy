import type { Tally } from "./store";

const SEGMENTS = 10;

export function ProgressTicks({ done, total, center = false }: Tally & { center?: boolean }) {
  const filled = total ? Math.round((done / total) * SEGMENTS) : 0;
  return (
    <span className={center ? "k c" : "k"} aria-hidden="true">
      {Array.from({ length: SEGMENTS }, (_, i) => (
        <b key={i} className={i < filled ? "f" : undefined} />
      ))}
    </span>
  );
}

export function ProgressSummary({ done, total }: Tally) {
  return (
    <>
      <ProgressTicks done={done} total={total} />
      <span className="sm">
        {done} of {total} items covered
      </span>
    </>
  );
}
