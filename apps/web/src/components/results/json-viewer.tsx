import { useCallback } from "react";
import { JsonView, darkStyles, defaultStyles } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";

interface JsonViewerProps {
  data: object | unknown[];
}

export const JsonViewer = ({ data }: JsonViewerProps) => {
  const isDark =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  const shouldExpandNode = useCallback((level: number) => level < 3, []);

  return (
    <div className="overflow-auto rounded-lg bg-muted p-4">
      <JsonView
        data={data}
        style={isDark ? darkStyles : defaultStyles}
        shouldExpandNode={shouldExpandNode}
      />
    </div>
  );
};
