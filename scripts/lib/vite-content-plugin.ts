import { readFile } from "node:fs/promises";
import path from "node:path";
import { createHighlighter, type Highlighter } from "shiki";
import type { Plugin } from "vite";
import { buildContentIndex, CONTENT_DIR } from "./content-fs.ts";
import { blueprintTheme } from "./shiki-theme.ts";

const INDEX_ID = "virtual:content-index";
const RESOLVED_INDEX_ID = "\0" + INDEX_ID;
const CODE_QUERY = "?code";

let highlighter: Promise<Highlighter> | undefined;
function getHighlighter(): Promise<Highlighter> {
  highlighter ??= createHighlighter({ themes: [blueprintTheme], langs: ["python"] });
  return highlighter;
}

/**
 * - `virtual:content-index`: topic/subject metadata and item counts, read from disk at build time.
 * - `*.py?code`: `{ source, html }` with the raw file and Shiki-highlighted HTML.
 */
export function contentPlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "prepbook-content",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
    },
    resolveId(id) {
      if (id === INDEX_ID) return RESOLVED_INDEX_ID;
      return null;
    },
    async load(id) {
      if (id === RESOLVED_INDEX_ID) {
        const contentRoot = path.join(root, CONTENT_DIR);
        this.addWatchFile(contentRoot);
        return `export default ${JSON.stringify(buildContentIndex(root))};`;
      }
      if (id.endsWith(".py" + CODE_QUERY)) {
        const file = id.slice(0, -CODE_QUERY.length);
        this.addWatchFile(file);
        const source = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
        const html = (await getHighlighter()).codeToHtml(source, { lang: "python", theme: "blueprint" });
        return `export default ${JSON.stringify({ source, html })};`;
      }
      return null;
    },
    configureServer(server) {
      const contentRoot = path.join(root, CONTENT_DIR);
      const refresh = (file: string) => {
        if (!path.resolve(file).startsWith(path.resolve(contentRoot)) || !file.endsWith(".json")) return;
        const mod = server.moduleGraph.getModuleById(RESOLVED_INDEX_ID);
        if (mod) server.moduleGraph.invalidateModule(mod);
        server.ws.send({ type: "full-reload" });
      };
      server.watcher.on("add", refresh);
      server.watcher.on("change", refresh);
      server.watcher.on("unlink", refresh);
    },
  };
}
