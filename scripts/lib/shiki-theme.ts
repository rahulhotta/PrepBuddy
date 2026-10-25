import type { ThemeRegistration } from "shiki";

/** Shiki theme built from the blueprint tokens (docs/DESIGN_TOKENS.md). */
export const blueprintTheme: ThemeRegistration = {
  name: "blueprint",
  type: "dark",
  colors: {
    "editor.background": "#072a63",
    "editor.foreground": "#f2f7ff",
  },
  tokenColors: [
    { scope: ["comment", "punctuation.definition.comment"], settings: { foreground: "#c4d6f5", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "storage.type", "keyword.operator.logical"], settings: { foreground: "#ffd23f" } },
    { scope: ["string", "punctuation.definition.string"], settings: { foreground: "#5eead4" } },
    { scope: ["entity.name.function", "support.function", "meta.function-call.generic"], settings: { foreground: "#ff8f70" } },
    {
      scope: ["entity.name.type", "entity.name.class", "support.type", "support.class", "entity.other.inherited-class"],
      settings: { foreground: "#c4a7ff" },
    },
    { scope: ["constant.numeric", "constant.language"], settings: { foreground: "#ff8f70" } },
    { scope: ["entity.name.function.decorator", "meta.function.decorator"], settings: { foreground: "#c4a7ff" } },
    { scope: ["variable.parameter", "variable.language.special.self"], settings: { foreground: "#f2f7ff" } },
  ],
};
