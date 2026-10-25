import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { metaSchema } from "../src/content/schema.ts";
import { CONTENT_DIR, listDirs, readJson } from "./lib/content-fs.ts";

const STATUSES = ["TODO", "PLACEHOLDER", "DRAFT", "DONE"] as const;
const COVERAGE_FILE = "docs/SYLLABUS_COVERAGE.md";

const root = process.cwd();
const strict = process.argv.includes("--strict");
const errors: string[] = [];
const warnings: string[] = [];

const subjects = new Map<string, string>();
const contentRoot = path.join(root, CONTENT_DIR);
for (const topic of listDirs(contentRoot)) {
  for (const subject of listDirs(path.join(contentRoot, topic))) {
    const metaFile = path.join(contentRoot, topic, subject, "meta.json");
    if (!existsSync(metaFile)) continue;
    const meta = metaSchema.safeParse(readJson(metaFile));
    subjects.set(subject, meta.success ? meta.data.status : "invalid");
  }
}

const markdown = readFileSync(path.join(root, COVERAGE_FILE), "utf8");
const section = markdown.split(/^## Coverage table\s*$/m)[1]?.split(/^## /m)[0];
if (!section) {
  console.error(`error ${COVERAGE_FILE}: "## Coverage table" section not found`);
  process.exit(1);
}

const rows = section
  .split(/\r?\n/)
  .filter((l) => l.trim().startsWith("|"))
  .map((l) => l.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
  .filter((cells) => !/^-+$/.test(cells[0] ?? "") && cells[0] !== "#");

const referenced = new Set<string>();
for (const [num, , item, ids = "", status = ""] of rows) {
  const where = `row ${num} "${item}"`;
  if (!STATUSES.includes(status as (typeof STATUSES)[number])) {
    errors.push(`${where}: status "${status}" must be one of ${STATUSES.join(", ")}`);
  }
  const idList = ids.split(",").map((s) => s.trim()).filter(Boolean);
  if (!idList.length) {
    errors.push(`${where}: has no subject id`);
    continue;
  }
  for (const id of idList) {
    referenced.add(id);
    const metaStatus = subjects.get(id);
    if (!metaStatus) {
      if (status !== "TODO") errors.push(`${where}: subject "${id}" does not exist but status is ${status}`);
      else if (strict) errors.push(`${where}: subject "${id}" not written yet (TODO)`);
    } else {
      if (status === "TODO") warnings.push(`${where}: subject "${id}" exists; update status`);
      if (status === "DONE" && metaStatus !== "complete") {
        errors.push(`${where}: marked DONE but meta.json status is "${metaStatus}"`);
      }
    }
  }
}

for (const id of subjects.keys()) {
  if (!referenced.has(id)) warnings.push(`subject "${id}" is not listed in ${COVERAGE_FILE}`);
}

const todo = rows.filter((r) => r[4] === "TODO").length;
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(
  `\nvalidate:coverage${strict ? " --strict" : ""}: ${rows.length} items, ${todo} TODO, ${errors.length} errors, ${warnings.length} warnings`,
);
process.exit(errors.length ? 1 : 0);
