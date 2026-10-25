import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import {
  metaSchema,
  topicSchema,
  type ContentIndex,
  type SubjectIndex,
  type TopicIndex,
} from "../../src/content/schema.ts";

export const CONTENT_DIR = "src/content";
export const PYTHON_DIR = "python-examples";

export function readJson(file: string): unknown {
  return JSON.parse(readFileSync(file, "utf8"));
}

export function listDirs(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => statSync(path.join(dir, name)).isDirectory())
    .sort();
}

function arrayLength(file: string, pick?: (data: unknown) => unknown): number {
  if (!existsSync(file)) return 0;
  const data = readJson(file);
  const value = pick ? pick(data) : data;
  return Array.isArray(value) ? value.length : 0;
}

/** Builds the small home-page index (topic + subject metadata and item counts) from disk. */
export function buildContentIndex(root: string): ContentIndex {
  const contentRoot = path.join(root, CONTENT_DIR);
  const topics: TopicIndex[] = [];

  for (const topicDir of listDirs(contentRoot)) {
    const topicFile = path.join(contentRoot, topicDir, "topic.json");
    if (!existsSync(topicFile)) continue;
    const topic = topicSchema.parse(readJson(topicFile));
    const subjects: SubjectIndex[] = [];

    for (const subjectDir of listDirs(path.join(contentRoot, topicDir))) {
      const dir = path.join(contentRoot, topicDir, subjectDir);
      const metaFile = path.join(dir, "meta.json");
      if (!existsSync(metaFile)) continue;
      const meta = metaSchema.parse(readJson(metaFile));
      subjects.push({
        ...meta,
        topicId: topic.id,
        counts: {
          qa: arrayLength(path.join(dir, "qa.json")),
          cards: arrayLength(path.join(dir, "cards.json")),
          steps: arrayLength(path.join(dir, "case-study.json"), (d) => (d as { steps?: unknown }).steps),
        },
      });
    }

    const sectionRank = new Map(topic.sections.map((s, i) => [s.id, i]));
    const rank = (s: SubjectIndex) => sectionRank.get(s.section) ?? Number.MAX_SAFE_INTEGER;
    subjects.sort((a, b) => rank(a) - rank(b) || a.order - b.order || a.title.localeCompare(b.title));
    topics.push({ ...topic, subjects });
  }

  topics.sort((a, b) => a.order - b.order);
  return { topics };
}
