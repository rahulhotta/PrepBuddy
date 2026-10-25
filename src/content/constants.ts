// Kept free of zod so the app bundle does not pull in the schema library.
export const MATERIAL_SLUGS = ["qa", "flashcards", "diagram", "explanation", "case-study"] as const;
export type MaterialSlug = (typeof MATERIAL_SLUGS)[number];

export const MATERIAL_FILES: Record<MaterialSlug, string> = {
  qa: "qa.json",
  flashcards: "cards.json",
  diagram: "diagram.json",
  explanation: "notes.mdx",
  "case-study": "case-study.json",
};

export const MATERIAL_LABELS: Record<MaterialSlug, string> = {
  qa: "Q&A",
  flashcards: "Flashcards",
  diagram: "Diagram",
  explanation: "Explanation",
  "case-study": "Case study",
};

export function pythonDirFor(subjectId: string): string {
  return subjectId.replaceAll("-", "_");
}
