import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { z } from "zod";
import {
  caseStudySchema,
  cardsSchema,
  CONCEPT_NOTES_HEADINGS,
  diagramSchema,
  EXAMPLE_REQUIRED_CATEGORIES,
  MATERIAL_FILES,
  MATERIAL_SLUGS,
  metaSchema,
  NOTES_HEADINGS,
  PATTERN_CATEGORIES,
  pythonDirFor,
  qaSchema,
  topicSchema,
  type MaterialSlug,
  type SubjectMeta,
} from "../src/content/schema.ts";
import { outOfBounds } from "../src/features/diagram/geometry.ts";
import { CONTENT_DIR, listDirs, PYTHON_DIR, readJson } from "./lib/content-fs.ts";

const root = process.cwd();
const errors: string[] = [];
const warnings: string[] = [];
const rel = (p: string) => path.relative(root, p).replaceAll("\\", "/");

function parse<T extends z.ZodType>(schema: T, file: string): z.infer<T> | undefined {
  let data: unknown;
  try {
    data = readJson(file);
  } catch (e) {
    errors.push(`${rel(file)}: invalid JSON (${(e as Error).message})`);
    return undefined;
  }
  const result = schema.safeParse(data);
  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${rel(file)}: ${issue.path.join(".") || "(root)"}: ${issue.message}`);
    }
    return undefined;
  }
  return result.data;
}

function checkIds(file: string, ids: string[], prefix: string): void {
  const pattern = new RegExp(`^${prefix}-\\d{2,}$`);
  const seen = new Set<string>();
  for (const id of ids) {
    if (!pattern.test(id)) errors.push(`${rel(file)}: id "${id}" must match ${prefix}-NN`);
    if (seen.has(id)) errors.push(`${rel(file)}: duplicate id "${id}"`);
    seen.add(id);
  }
}

interface Rules {
  headings: readonly string[];
  qa: [number, number];
  cards: [number, number];
  materials: readonly MaterialSlug[];
}

const PATTERN_RULES: Rules = {
  headings: NOTES_HEADINGS,
  qa: [6, 8],
  cards: [8, 10],
  materials: ["qa", "flashcards", "diagram", "explanation"],
};
const CONCEPT_RULES: Rules = {
  headings: CONCEPT_NOTES_HEADINGS,
  qa: [3, 6],
  cards: [4, 8],
  materials: ["qa", "flashcards", "explanation"],
};

function rulesFor(meta: SubjectMeta): Rules | undefined {
  if (PATTERN_CATEGORIES.includes(meta.category)) return PATTERN_RULES;
  if (meta.category === "concept" || meta.category === "principle") return CONCEPT_RULES;
  return undefined;
}

function checkNotes(file: string, meta: SubjectMeta): void {
  const rules = rulesFor(meta);
  if (!rules) return;
  const headings = readFileSync(file, "utf8")
    .split(/\r?\n/)
    .filter((l) => l.startsWith("## "))
    .map((l) => l.slice(3).trim());
  if (headings.join("|") !== rules.headings.join("|")) {
    errors.push(`${rel(file)}: headings must be exactly, in order: ${rules.headings.join(", ")} (found: ${headings.join(", ")})`);
  }
}

function checkExample(meta: SubjectMeta): void {
  const dir = path.join(root, PYTHON_DIR, pythonDirFor(meta.id));
  const exists = existsSync(dir);
  if (meta.example) {
    for (const f of ["__init__.py", "example.py", "test_example.py"]) {
      if (!existsSync(path.join(dir, f))) errors.push(`${rel(dir)}/${f}: missing (meta.example is true)`);
    }
    const example = path.join(dir, "example.py");
    if (existsSync(example) && !readFileSync(example, "utf8").includes("# Expected output:")) {
      errors.push(`${rel(example)}: missing "# Expected output:" block`);
    }
  } else if (exists) {
    errors.push(`${rel(dir)}: exists but meta.example is false for "${meta.id}"`);
  }
  if (!meta.example && EXAMPLE_REQUIRED_CATEGORIES.includes(meta.category)) {
    const msg = `${meta.id}: ${meta.category} subjects need a Python example`;
    if (meta.status === "placeholder") warnings.push(msg);
    else errors.push(msg);
  }
}

function checkCompleteness(meta: SubjectMeta, counts: { qa: number; cards: number }): void {
  const rules = rulesFor(meta);
  if (!rules) return;
  const problems: string[] = [];
  const [qaMin, qaMax] = rules.qa;
  const [cardMin, cardMax] = rules.cards;
  if (counts.qa < qaMin || counts.qa > qaMax) problems.push(`${counts.qa} Q&As (want ${qaMin}-${qaMax})`);
  if (counts.cards < cardMin || counts.cards > cardMax) problems.push(`${counts.cards} flashcards (want ${cardMin}-${cardMax})`);
  for (const m of rules.materials) {
    if (!meta.materials.includes(m)) problems.push(`missing material "${m}"`);
  }
  if (!problems.length) return;
  const msg = `${meta.id}: ${problems.join("; ")}`;
  if (meta.status === "complete") errors.push(msg);
  else warnings.push(msg);
}

const contentRoot = path.join(root, CONTENT_DIR);
const subjectOwners = new Map<string, string>();
const materialFileNames = new Set(Object.values(MATERIAL_FILES));

for (const topicDir of listDirs(contentRoot)) {
  const topicPath = path.join(contentRoot, topicDir);
  const topicFile = path.join(topicPath, "topic.json");
  if (!existsSync(topicFile)) {
    errors.push(`${rel(topicPath)}: missing topic.json`);
    continue;
  }
  const topic = parse(topicSchema, topicFile);
  if (topic && topic.id !== topicDir) errors.push(`${rel(topicFile)}: id "${topic.id}" must equal folder "${topicDir}"`);

  for (const subjectDir of listDirs(topicPath)) {
    const dir = path.join(topicPath, subjectDir);
    const metaFile = path.join(dir, "meta.json");
    if (!existsSync(metaFile)) {
      errors.push(`${rel(dir)}: missing meta.json`);
      continue;
    }
    const meta = parse(metaSchema, metaFile);
    if (!meta) continue;
    if (meta.id !== subjectDir) errors.push(`${rel(metaFile)}: id "${meta.id}" must equal folder "${subjectDir}"`);
    if (topic && !topic.sections.some((s) => s.id === meta.section)) {
      errors.push(`${rel(metaFile)}: section "${meta.section}" is not defined in ${rel(topicFile)}`);
    }
    const owner = subjectOwners.get(meta.id);
    if (owner) errors.push(`${rel(metaFile)}: subject id "${meta.id}" already used in ${owner}`);
    subjectOwners.set(meta.id, topicDir);

    for (const file of readdirSync(dir)) {
      if (file !== "meta.json" && !materialFileNames.has(file)) warnings.push(`${rel(path.join(dir, file))}: unknown file`);
    }

    const counts = { qa: 0, cards: 0 };
    for (const slug of MATERIAL_SLUGS) {
      const file = path.join(dir, MATERIAL_FILES[slug]);
      const listed = meta.materials.includes(slug);
      const exists = existsSync(file);
      if (listed && !exists) errors.push(`${rel(file)}: listed in materials but missing`);
      if (!listed && exists) errors.push(`${rel(file)}: exists but "${slug}" is not listed in materials`);
      if (!exists) continue;

      switch (slug) {
        case "qa": {
          const qa = parse(qaSchema, file);
          if (qa) {
            checkIds(file, qa.map((q) => q.id), `${meta.id}-qa`);
            counts.qa = qa.length;
          }
          break;
        }
        case "flashcards": {
          const cards = parse(cardsSchema, file);
          if (cards) {
            checkIds(file, cards.map((c) => c.id), `${meta.id}-card`);
            counts.cards = cards.length;
          }
          break;
        }
        case "diagram": {
          const diagram = parse(diagramSchema, file);
          if (!diagram) break;
          const ids = new Set<string>();
          for (const n of diagram.nodes) {
            if (ids.has(n.id)) errors.push(`${rel(file)}: duplicate node id "${n.id}"`);
            ids.add(n.id);
          }
          for (const e of diagram.edges ?? []) {
            for (const end of [e.from, e.to]) {
              if (!ids.has(end)) errors.push(`${rel(file)}: edge references unknown node "${end}"`);
            }
          }
          const outside = outOfBounds(diagram);
          if (outside.length) warnings.push(`${rel(file)}: nodes outside the canvas: ${outside.join(", ")}`);
          break;
        }
        case "case-study":
          parse(caseStudySchema, file);
          break;
        case "explanation":
          checkNotes(file, meta);
          break;
      }
    }

    checkExample(meta);
    checkCompleteness(meta, counts);
  }
}

for (const dir of listDirs(path.join(root, PYTHON_DIR))) {
  if (dir.startsWith("__") || dir.startsWith(".")) continue;
  const known = [...subjectOwners.keys()].some((id) => pythonDirFor(id) === dir);
  if (!known) errors.push(`${PYTHON_DIR}/${dir}: no subject with id matching this folder`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`\nvalidate:content: ${subjectOwners.size} subjects, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
