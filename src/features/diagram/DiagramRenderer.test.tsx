import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { BoxNode, ClassNode, Diagram } from "../../content/schema";
import { DiagramRenderer } from "./DiagramRenderer";
import { connect, layoutClass } from "./geometry";

const node = (id: string, x: number, y: number): BoxNode => ({
  id,
  kind: "box",
  x,
  y,
  width: 100,
  height: 50,
  label: [id],
  color: 0,
});

const diagram: Diagram = {
  title: "Test diagram",
  description: "Every relationship type once.",
  width: 800,
  height: 400,
  nodes: [
    { id: "iface", kind: "class", x: 300, y: 10, name: "Shape", stereotype: "interface", fields: [], methods: ["+ area()"] },
    node("a", 10, 200),
    node("b", 200, 200),
    node("c", 400, 200),
    node("d", 600, 200),
  ],
  edges: [
    { from: "a", to: "iface", type: "inheritance" },
    { from: "b", to: "iface", type: "implements" },
    { from: "a", to: "b", type: "association", label: "uses" },
    { from: "b", to: "c", type: "aggregation" },
    { from: "c", to: "d", type: "composition" },
    { from: "d", to: "iface", type: "dependency" },
    { from: "a", to: "d", type: "flow" },
  ],
};

describe("DiagramRenderer", () => {
  it("is labelled and described for assistive tech", () => {
    render(<DiagramRenderer diagram={diagram} />);
    const img = screen.getByRole("img", { name: "Test diagram" });
    expect(img).toHaveAccessibleDescription("Every relationship type once.");
  });

  it("draws class nodes with stereotype, name and members", () => {
    const { container } = render(<DiagramRenderer diagram={diagram} />);
    const cls = container.querySelector('[data-node="iface"]')!;
    expect(cls.textContent).toContain("<<interface>>");
    expect(cls.textContent).toContain("Shape");
    expect(cls.textContent).toContain("+ area()");
  });

  it("uses the right line style and markers for each relationship", () => {
    const { container } = render(<DiagramRenderer diagram={diagram} />);
    const edge = (type: string) => container.querySelector(`[data-edge="${type}"] path`)!;
    const marker = (el: Element, attr: string) => el.getAttribute(attr)?.match(/-(\w+)\)$/)?.[1] ?? null;

    expect(marker(edge("inheritance"), "marker-end")).toBe("tri");
    expect(edge("inheritance")).not.toHaveClass("dash");
    expect(marker(edge("implements"), "marker-end")).toBe("tri");
    expect(edge("implements")).toHaveClass("dash");
    expect(marker(edge("association"), "marker-end")).toBe("open");
    expect(marker(edge("dependency"), "marker-end")).toBe("open");
    expect(edge("dependency")).toHaveClass("dash");
    expect(marker(edge("aggregation"), "marker-start")).toBe("diaHollow");
    expect(marker(edge("composition"), "marker-start")).toBe("diaFilled");
    expect(marker(edge("flow"), "marker-end")).toBe("arrow");
    expect(edge("flow")).toHaveClass("flow");
    expect(screen.getByText("uses")).toBeInTheDocument();
  });

  it("makes the scroll container keyboard reachable", () => {
    render(<DiagramRenderer diagram={diagram} />);
    expect(screen.getByRole("group", { name: "Test diagram, scrollable" })).toHaveAttribute("tabindex", "0");
  });
});

describe("geometry", () => {
  it("grows class nodes with their rows", () => {
    const base: ClassNode = { id: "x", kind: "class", x: 0, y: 0, name: "X", fields: [], methods: [] };
    const small = layoutClass(base);
    const big = layoutClass({ ...base, fields: ["a", "b"], methods: ["c"] });
    expect(big.height).toBeGreaterThan(small.height);
  });

  it("connects facing sides", () => {
    const a = { x: 0, y: 0, width: 100, height: 50 };
    expect(connect(a, { x: 0, y: 200, width: 100, height: 50 })).toEqual({ x1: 50, y1: 50, x2: 50, y2: 200 });
    expect(connect(a, { x: 300, y: 0, width: 100, height: 50 })).toEqual({ x1: 100, y1: 25, x2: 300, y2: 25 });
  });
});
