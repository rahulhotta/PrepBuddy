/// <reference types="vite/client" />

declare module "virtual:content-index" {
  import type { ContentIndex } from "./content/schema";
  const index: ContentIndex;
  export default index;
}

declare module "*.mdx" {
  import type { ComponentType } from "react";
  const MDXComponent: ComponentType<Record<string, unknown>>;
  export default MDXComponent;
}

declare module "*.py?code" {
  const code: { source: string; html: string };
  export default code;
}
