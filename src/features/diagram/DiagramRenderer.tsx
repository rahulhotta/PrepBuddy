import { useId } from "react";
import type { BoxNode, ClassNode, Diagram, EdgeType } from "../../content/schema";
import { connect, layoutClass, LINE_HEIGHT, nodeRect, PAD } from "./geometry";

const FILLS = ["var(--yellow)", "var(--mint)", "var(--lilac)", "var(--coral)"];

type MarkerName = "arrow" | "open" | "tri" | "diaHollow" | "diaFilled";

export const EDGE_STYLES: Record<EdgeType, { dash?: boolean; flow?: boolean; start?: MarkerName; end?: MarkerName }> = {
  inheritance: { end: "tri" },
  implements: { dash: true, end: "tri" },
  association: { end: "open" },
  dependency: { dash: true, end: "open" },
  aggregation: { start: "diaHollow" },
  composition: { start: "diaFilled" },
  flow: { flow: true, end: "arrow" },
};

function Markers({ prefix }: { prefix: string }) {
  const common = { orient: "auto", markerUnits: "userSpaceOnUse" } as const;
  return (
    <defs>
      <marker id={`${prefix}arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="10" markerHeight="10" {...common}>
        <path d="M0 0L10 5L0 10z" fill="var(--ln)" />
      </marker>
      <marker id={`${prefix}open`} viewBox="0 0 10 10" refX="10" refY="5" markerWidth="12" markerHeight="12" {...common}>
        <path d="M0 0L10 5L0 10" fill="none" stroke="var(--ln)" strokeWidth="1.5" />
      </marker>
      <marker id={`${prefix}tri`} viewBox="0 0 12 12" refX="12" refY="6" markerWidth="16" markerHeight="16" {...common}>
        <path d="M0 0L12 6L0 12z" fill="var(--bg)" stroke="var(--ln)" strokeWidth="1.5" />
      </marker>
      <marker id={`${prefix}diaHollow`} viewBox="0 0 16 10" refX="0" refY="5" markerWidth="20" markerHeight="12" {...common}>
        <path d="M0 5L8 0L16 5L8 10z" fill="var(--bg)" stroke="var(--ln)" strokeWidth="1.5" />
      </marker>
      <marker id={`${prefix}diaFilled`} viewBox="0 0 16 10" refX="0" refY="5" markerWidth="20" markerHeight="12" {...common}>
        <path d="M0 5L8 0L16 5L8 10z" fill="var(--ln)" stroke="var(--ln)" strokeWidth="1.5" />
      </marker>
    </defs>
  );
}

function ClassShape({ node }: { node: ClassNode }) {
  const box = layoutClass(node);
  const color = node.color ?? (node.stereotype === "interface" ? 1 : node.stereotype === "abstract" ? 2 : 0);
  const cx = box.x + box.width / 2;
  const right = box.x + box.width;
  const row = (top: number, i: number) => top + PAD / 2 + LINE_HEIGHT * (i + 1) - 4;

  return (
    <g data-node={node.id}>
      <rect className="nd" x={box.x} y={box.y} width={box.width} height={box.height} style={{ fill: FILLS[color] }} />
      {box.headerLines.map((line, i) => {
        const isStereotype = node.stereotype !== undefined && i === 0;
        return (
          <text
            key={i}
            x={cx}
            y={box.y + PAD + LINE_HEIGHT * (i + 1) - 4}
            textAnchor="middle"
            className={isStereotype ? "cls-row" : undefined}
            fontStyle={!isStereotype && node.stereotype === "abstract" ? "italic" : undefined}
          >
            {line}
          </text>
        );
      })}
      <line className="nd" x1={box.x} y1={box.fieldsY} x2={right} y2={box.fieldsY} />
      {node.fields?.map((f, i) => (
        <text key={f} className="cls-row" x={box.x + 10} y={row(box.fieldsY, i)} textAnchor="start">
          {f}
        </text>
      ))}
      <line className="nd" x1={box.x} y1={box.methodsY} x2={right} y2={box.methodsY} />
      {node.methods?.map((m, i) => (
        <text key={m} className="cls-row" x={box.x + 10} y={row(box.methodsY, i)} textAnchor="start">
          {m}
        </text>
      ))}
    </g>
  );
}

function BoxShape({ node }: { node: BoxNode }) {
  const top = node.y + node.height / 2 - (node.label.length - 1) * 9 + 5;
  return (
    <g data-node={node.id}>
      <rect className="nd" x={node.x} y={node.y} width={node.width} height={node.height} style={{ fill: FILLS[node.color ?? 0] }} />
      {node.label.map((line, i) => (
        <text key={i} x={node.x + node.width / 2} y={top + i * 18} textAnchor="middle">
          {line}
        </text>
      ))}
    </g>
  );
}

export function DiagramRenderer({ diagram }: { diagram: Diagram }) {
  const prefix = `dg${useId().replace(/[^a-zA-Z0-9]/g, "")}-`;
  const descId = `${prefix}desc`;
  const rects = new Map(diagram.nodes.map((n) => [n.id, nodeRect(n)]));
  const url = (m?: MarkerName) => (m ? `url(#${prefix}${m})` : undefined);

  return (
    <figure className="fig">
      <div className="svgw" tabIndex={0} role="group" aria-label={`${diagram.title}, scrollable`}>
        <svg
          className="dg"
          viewBox={`0 0 ${diagram.width} ${diagram.height}`}
          width={diagram.width}
          height={diagram.height}
          role="img"
          aria-label={diagram.title}
          aria-describedby={descId}
        >
          <Markers prefix={prefix} />
          {(diagram.edges ?? []).map((e, i) => {
            const a = rects.get(e.from);
            const b = rects.get(e.to);
            if (!a || !b) return null;
            const s = connect(a, b);
            const style = EDGE_STYLES[e.type];
            const cls = ["ed", style.dash && "dash", style.flow && "flow"].filter(Boolean).join(" ");
            return (
              <g key={i} data-edge={e.type}>
                <path
                  className={cls}
                  d={`M${s.x1} ${s.y1}L${s.x2} ${s.y2}`}
                  markerStart={url(style.start)}
                  markerEnd={url(style.end)}
                />
                {e.label && (
                  <text className="el" x={(s.x1 + s.x2) / 2} y={(s.y1 + s.y2) / 2 - 7} textAnchor="middle">
                    {e.label}
                  </text>
                )}
              </g>
            );
          })}
          {diagram.nodes.map((n) => (n.kind === "class" ? <ClassShape key={n.id} node={n} /> : <BoxShape key={n.id} node={n} />))}
        </svg>
      </div>
      <figcaption>
        <span className="l">FIG. {diagram.title.toUpperCase()}</span>
        <p id={descId}>{diagram.description}</p>
      </figcaption>
    </figure>
  );
}
