import Markdown from "react-markdown";

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer = ({ content }: MarkdownViewerProps) => (
  <div className="prose prose-sm dark:prose-invert max-w-none">
    <Markdown
      components={{
        blockquote: ({ children }) => (
          <blockquote className="my-4 border-l-4 border-muted-foreground/30 pl-4 italic">
            {children}
          </blockquote>
        ),
        code: ({ children, className }) => {
          const isInline = !className;
          if (isInline) {
            return (
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                {children}
              </code>
            );
          }
          return (
            <code className="block overflow-x-auto rounded-lg bg-muted p-4 font-mono text-sm">
              {children}
            </code>
          );
        },
        h1: ({ children }) => (
          <h1 className="mb-4 text-xl font-bold">{children}</h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-6 text-lg font-semibold">{children}</h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-4 text-base font-semibold">{children}</h3>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        ol: ({ children }) => (
          <ol className="mb-3 list-decimal space-y-1 pl-6">{children}</ol>
        ),
        p: ({ children }) => <p className="mb-3 leading-relaxed">{children}</p>,
        pre: ({ children }) => <pre className="my-4">{children}</pre>,
        table: ({ children }) => (
          <div className="my-4 overflow-x-auto">
            <table className="w-full border-collapse border border-border text-sm">
              {children}
            </table>
          </div>
        ),
        td: ({ children }) => (
          <td className="border border-border px-3 py-2">{children}</td>
        ),
        th: ({ children }) => (
          <th className="border border-border px-3 py-2 text-left font-medium">
            {children}
          </th>
        ),
        thead: ({ children }) => <thead className="bg-muted">{children}</thead>,
        ul: ({ children }) => (
          <ul className="mb-3 list-disc space-y-1 pl-6">{children}</ul>
        ),
      }}
    >
      {content}
    </Markdown>
  </div>
);
