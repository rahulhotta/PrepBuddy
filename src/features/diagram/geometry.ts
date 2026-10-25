import type { ClassNode, Diagram, DiagramNode } from "../../content/schema";

export const LINE_HEIGHT = 18;
export const PAD = 8;
export const DEFAULT_CLASS_WIDTH = 200;
const EMPTY_SECTION = 10;

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClassLayout extends Rect {
  headerLines: string[];
  fieldsY: number;
  methodsY: number;
}

function sectionHeight(rows: number): number {
  return rows ? rows * LINE_HEIGHT + PAD : EMPTY_SECTION;
}

export function layoutClass(node: ClassNode): ClassLayout {
  const headerLines = node.stereotype ? [`<<${node.stereotype}>>`, node.name] : [node.name];
  const headerH = headerLines.length * LINE_HEIGHT + PAD * 2;
  const fieldsH = sectionHeight(node.fields?.length ?? 0);
  const methodsH = sectionHeight(node.methods?.length ?? 0);
  return {
    x: node.x,
    y: node.y,
    width: node.width ?? DEFAULT_CLASS_WIDTH,
    height: headerH + fieldsH + methodsH,
    headerLines,
    fieldsY: node.y + headerH,
    methodsY: node.y + headerH + fieldsH,
  };
}

export function nodeRect(node: DiagramNode): Rect {
  if (node.kind === "class") return layoutClass(node);
  return { x: node.x, y: node.y, width: node.width, height: node.height };
}

export interface Segment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

/** Connects the facing sides of two boxes, vertically or horizontally (same rule as the prototype). */
export function connect(a: Rect, b: Rect): Segment {
  const ax = a.x + a.width / 2;
  const ay = a.y + a.height / 2;
  const bx = b.x + b.width / 2;
  const by = b.y + b.height / 2;
  if (Math.abs(by - ay) >= Math.abs(bx - ax) * 0.6) {
    return by > ay
      ? { x1: ax, y1: a.y + a.height, x2: bx, y2: b.y }
      : { x1: ax, y1: a.y, x2: bx, y2: b.y + b.height };
  }
  return bx > ax
    ? { x1: a.x + a.width, y1: ay, x2: b.x, y2: by }
    : { x1: a.x, y1: ay, x2: b.x + b.width, y2: by };
}

export function outOfBounds(diagram: Diagram): string[] {
  return diagram.nodes
    .filter((n) => {
      const r = nodeRect(n);
      return r.x < 0 || r.y < 0 || r.x + r.width > diagram.width || r.y + r.height > diagram.height;
    })
    .map((n) => n.id);
}
