import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Renders content markdown. Raw HTML in content is dropped, never injected. */
export function ContentMarkdown({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} skipHtml>
      {children}
    </Markdown>
  );
}
