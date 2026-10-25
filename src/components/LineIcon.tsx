import type { ReactNode } from "react";
import type { Topic } from "../content/schema";

const PATHS: Record<Topic["icon"], ReactNode> = {
  lld: (
    <>
      <rect x="2" y="2" width="22" height="14" style={{ fill: "var(--a)" }} />
      <rect x="2" y="30" width="22" height="14" />
      <rect x="46" y="16" width="22" height="14" />
      <path d="M24 9h10v14h12M24 37h10V23" />
    </>
  ),
  hld: (
    <>
      <rect x="2" y="16" width="16" height="14" />
      <rect x="27" y="2" width="16" height="14" style={{ fill: "var(--a)" }} />
      <rect x="27" y="30" width="16" height="14" />
      <rect x="52" y="16" width="16" height="14" />
      <path d="M18 23h5l4-14M18 23h5l4 14M43 9l5 14M43 37l5-14" />
    </>
  ),
  ang: (
    <>
      <circle cx="12" cy="23" r="9" style={{ fill: "var(--a)" }} />
      <circle cx="58" cy="10" r="8" />
      <circle cx="58" cy="36" r="8" />
      <path d="M21 23h12l16-13M33 23l16 13" />
    </>
  ),
  dsa: (
    <>
      <path d="M2 42h66M10 42V22M26 42V10M42 42V30M58 42V16" />
      <circle cx="10" cy="18" r="4" style={{ fill: "var(--a)" }} />
      <circle cx="58" cy="12" r="4" style={{ fill: "var(--a)" }} />
    </>
  ),
};

export function LineIcon({ icon }: { icon: Topic["icon"] }) {
  return (
    <svg className="mini" aria-hidden="true" focusable="false" width="70" height="46" viewBox="0 0 70 46">
      {PATHS[icon]}
    </svg>
  );
}
