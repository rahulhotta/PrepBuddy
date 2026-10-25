import { describe, expect, it } from "vitest";
import {
  ContentNotFoundError,
  getSubject,
  getTopic,
  hasMaterial,
  loadCards,
  loadCaseStudy,
  loadDiagram,
  loadExample,
  loadNotes,
  loadQa,
  topics,
} from "./index";
import { cardsSchema, caseStudySchema, diagramSchema, qaSchema } from "./schema";

describe("content index", () => {
  it("lists topics with subject metadata and counts but no material bodies", () => {
    const lld = getTopic("low-level-design");
    expect(lld?.title).toBe("Low Level Design");
    const observer = lld?.subjects.find((s) => s.id === "observer");
    expect(observer?.counts.qa).toBeGreaterThan(0);
    expect(observer).not.toHaveProperty("questions");
    expect(topics.length).toBeGreaterThan(0);
  });

  it("returns undefined for unknown ids", () => {
    expect(getTopic("nope")).toBeUndefined();
    expect(getSubject("low-level-design", "nope")).toBeUndefined();
  });

  it("knows which materials a subject has", () => {
    const observer = getSubject("low-level-design", "observer")!;
    expect(hasMaterial(observer, "qa")).toBe(true);
    expect(hasMaterial(observer, "case-study")).toBe(false);
    expect(hasMaterial(observer, undefined)).toBe(false);
  });
});

describe("lazy loaders", () => {
  const observer = () => getSubject("low-level-design", "observer")!;
  const parking = () => getSubject("low-level-design", "parking-lot")!;

  it("loads valid Q&A, cards and diagrams on demand", async () => {
    const qa = await loadQa(observer());
    expect(qaSchema.parse(qa)).toHaveLength(observer().counts.qa);
    expect(cardsSchema.parse(await loadCards(observer()))).toHaveLength(observer().counts.cards);
    expect(diagramSchema.parse(await loadDiagram(observer())).nodes.length).toBeGreaterThan(0);
  });

  it("loads a case study", async () => {
    const cs = caseStudySchema.parse(await loadCaseStudy(parking()));
    expect(cs.steps).toHaveLength(parking().counts.steps);
  });

  it("loads notes as a component and the real Python example with highlighted HTML", async () => {
    expect(typeof (await loadNotes(observer()))).toBe("function");
    const example = await loadExample(observer());
    expect(example?.path).toBe("python-examples/observer/example.py");
    expect(example?.source).toContain("# Expected output:");
    expect(example?.html).toContain('class="shiki');
  }, 30_000); // first Shiki highlighter start-up is slow

  it("returns null when a subject has no example", async () => {
    expect(await loadExample(parking())).toBeNull();
  });

  it("rejects with ContentNotFoundError for a missing material", async () => {
    await expect(loadQa(parking())).rejects.toBeInstanceOf(ContentNotFoundError);
  });
});
