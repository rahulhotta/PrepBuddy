import { AsyncView } from "../../components/AsyncView";
import { loadDiagram } from "../../content";
import type { SubjectIndex } from "../../content/schema";
import { useAsync } from "../../lib/useAsync";
import { DiagramRenderer } from "./DiagramRenderer";

export default function DiagramView({ subject }: { subject: SubjectIndex }) {
  const state = useAsync(() => loadDiagram(subject), subject.id);
  return <AsyncView state={state}>{(diagram) => <DiagramRenderer diagram={diagram} />}</AsyncView>;
}
