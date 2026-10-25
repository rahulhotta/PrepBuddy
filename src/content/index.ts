import type { ComponentType } from "react";
import contentIndex from "virtual:content-index";
import { pythonDirFor, type MaterialSlug } from "./constants";
import type { CaseStudy, Card, Diagram, QaItem, SubjectIndex, TopicIndex } from "./schema";

export type PythonExample = { source: string; html: string; path: string };

// Each file becomes its own lazily loaded chunk.
const qaFiles = import.meta.glob<QaItem[]>("./*/*/qa.json", { import: "default" });
const cardFiles = import.meta.glob<Card[]>("./*/*/cards.json", { import: "default" });
const diagramFiles = import.meta.glob<Diagram>("./*/*/diagram.json", { import: "default" });
const caseStudyFiles = import.meta.glob<CaseStudy>("./*/*/case-study.json", { import: "default" });
const notesFiles = import.meta.glob<ComponentType>("./*/*/notes.mdx", { import: "default" });
const exampleFiles = import.meta.glob<{ source: string; html: string }>("/python-examples/*/example.py", {
  query: "?code",
  import: "default",
});

export const topics: readonly TopicIndex[] = contentIndex.topics;

export class ContentNotFoundError extends Error {}

export function getTopic(topicId: string | undefined): TopicIndex | undefined {
  return topics.find((t) => t.id === topicId);
}

export function getSubject(topicId: string | undefined, subjectId: string | undefined): SubjectIndex | undefined {
  return getTopic(topicId)?.subjects.find((s) => s.id === subjectId);
}

export function hasMaterial(subject: SubjectIndex, material: string | undefined): material is MaterialSlug {
  return subject.materials.includes(material as MaterialSlug);
}

/** "DWG 08-02": section number, then position within that section. */
export function drawingLabel(topic: TopicIndex, subject: SubjectIndex): string {
  const section = topic.sections.findIndex((s) => s.id === subject.section) + 1;
  const position = topic.subjects.filter((s) => s.section === subject.section).indexOf(subject) + 1;
  return `DWG ${String(section).padStart(2, "0")}-${String(position).padStart(2, "0")}`;
}

async function loadFrom<T>(
  files: Record<string, () => Promise<T>>,
  subject: SubjectIndex,
  fileName: string,
): Promise<T> {
  const load = files[`./${subject.topicId}/${subject.id}/${fileName}`];
  if (!load) throw new ContentNotFoundError(`${fileName} not found for ${subject.topicId}/${subject.id}`);
  return load();
}

export const loadQa = (s: SubjectIndex) => loadFrom(qaFiles, s, "qa.json");
export const loadCards = (s: SubjectIndex) => loadFrom(cardFiles, s, "cards.json");
export const loadDiagram = (s: SubjectIndex) => loadFrom(diagramFiles, s, "diagram.json");
export const loadCaseStudy = (s: SubjectIndex) => loadFrom(caseStudyFiles, s, "case-study.json");
export const loadNotes = (s: SubjectIndex) => loadFrom(notesFiles, s, "notes.mdx");

export async function loadExample(subject: SubjectIndex): Promise<PythonExample | null> {
  if (!subject.example) return null;
  const path = `/python-examples/${pythonDirFor(subject.id)}/example.py`;
  const load = exampleFiles[path];
  if (!load) throw new ContentNotFoundError(`${path} not found`);
  return { ...(await load()), path: path.slice(1) };
}
