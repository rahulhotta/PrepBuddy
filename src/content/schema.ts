import { z } from "zod";
import { MATERIAL_SLUGS } from "./constants.ts";

export * from "./constants.ts";

export const CATEGORIES = [
  "concept",
  "principle",
  "creational",
  "structural",
  "behavioral",
  "case-study",
] as const;
export type Category = (typeof CATEGORIES)[number];

export const PATTERN_CATEGORIES: readonly Category[] = ["creational", "structural", "behavioral"];
export const EXAMPLE_REQUIRED_CATEGORIES: readonly Category[] = [...PATTERN_CATEGORIES, "case-study"];

export const NOTES_HEADINGS = [
  "Intent",
  "Problem",
  "Solution",
  "Structure",
  "When to use",
  "Trade-offs",
  "Interview pitfalls",
  "Related patterns",
  "Pythonic note",
] as const;

export const CONCEPT_NOTES_HEADINGS = [
  "Overview",
  "Key ideas",
  "Example",
  "Common mistakes",
  "Interview angle",
  "Related topics",
] as const;

const slug = z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "must be lowercase kebab-case");
const text = z.string().trim().min(1);

export const ACCENTS = ["yellow", "coral", "mint", "lilac"] as const;
export type Accent = (typeof ACCENTS)[number];

export const topicSchema = z.strictObject({
  id: slug,
  title: text,
  blurb: text,
  accent: z.enum(ACCENTS),
  icon: z.enum(["lld", "hld", "ang", "dsa"]),
  order: z.number().int(),
  sections: z
    .array(z.strictObject({ id: slug, title: text }))
    .min(1)
    .refine((s) => new Set(s.map((x) => x.id)).size === s.length, "section ids must be unique"),
});
export type Topic = z.infer<typeof topicSchema>;
export type Section = Topic["sections"][number];

export const metaSchema = z.strictObject({
  id: slug,
  title: text,
  tag: text,
  section: slug,
  category: z.enum(CATEGORIES),
  order: z.number().int(),
  materials: z
    .array(z.enum(MATERIAL_SLUGS))
    .min(1)
    .refine((m) => new Set(m).size === m.length, "materials must be unique"),
  example: z.boolean().default(false),
  status: z.enum(["placeholder", "draft", "complete"]),
});
export type SubjectMeta = z.infer<typeof metaSchema>;

export const qaSchema = z.array(
  z.strictObject({
    id: text,
    question: text,
    answer: text,
    difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  }),
);
export type QaItem = z.infer<typeof qaSchema>[number];

export const cardsSchema = z.array(z.strictObject({ id: text, front: text, back: text }));
export type Card = z.infer<typeof cardsSchema>[number];

export const caseStudySchema = z.strictObject({
  title: text,
  steps: z.array(z.strictObject({ heading: text, body: text })).min(1),
});
export type CaseStudy = z.infer<typeof caseStudySchema>;

export const EDGE_TYPES = [
  "inheritance",
  "implements",
  "association",
  "aggregation",
  "composition",
  "dependency",
  "flow",
] as const;
export type EdgeType = (typeof EDGE_TYPES)[number];

const colorIndex = z.number().int().min(0).max(3);

const classNodeSchema = z.strictObject({
  id: text,
  kind: z.literal("class"),
  x: z.number(),
  y: z.number(),
  width: z.number().positive().optional(),
  name: text,
  stereotype: z.enum(["interface", "abstract"]).optional(),
  fields: z.array(z.string()).optional(),
  methods: z.array(z.string()).optional(),
  color: colorIndex.optional(),
});

const boxNodeSchema = z.strictObject({
  id: text,
  kind: z.literal("box"),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  label: z.array(text).min(1),
  color: colorIndex.optional(),
});

export const diagramSchema = z.strictObject({
  title: text,
  description: text,
  width: z.number().positive(),
  height: z.number().positive(),
  nodes: z.array(z.discriminatedUnion("kind", [classNodeSchema, boxNodeSchema])).min(1),
  edges: z
    .array(z.strictObject({ from: text, to: text, type: z.enum(EDGE_TYPES), label: z.string().optional() }))
    .optional(),
});
// Material files are loaded without parsing at runtime, so schemas avoid .default() outside meta.json.
export type Diagram = z.infer<typeof diagramSchema>;
export type DiagramNode = Diagram["nodes"][number];
export type ClassNode = Extract<DiagramNode, { kind: "class" }>;
export type BoxNode = Extract<DiagramNode, { kind: "box" }>;
export type DiagramEdge = NonNullable<Diagram["edges"]>[number];

export interface SubjectCounts {
  qa: number;
  cards: number;
  steps: number;
}

export interface SubjectIndex extends SubjectMeta {
  topicId: string;
  counts: SubjectCounts;
}

export interface TopicIndex extends Topic {
  subjects: SubjectIndex[];
}

export interface ContentIndex {
  topics: TopicIndex[];
}
