import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { DownloadButton } from "./download-button";
import { JsonViewer } from "./json-viewer";
import { MarkdownViewer } from "./markdown-viewer";

interface ResultViewerProps {
  jobId: string;
  markdownResult: string | null;
  jsonResult: unknown | null;
  jobType: "parse" | "extract";
}

export const ResultViewer = ({
  jobId,
  markdownResult,
  jsonResult,
  jobType,
}: ResultViewerProps) => {
  const hasMarkdown = !!markdownResult;
  const hasJson = !!jsonResult;

  if (!hasMarkdown && !hasJson) {
    return null;
  }

  const defaultTab = jobType === "extract" && hasJson ? "json" : "markdown";

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg">Results</CardTitle>
        <div className="flex gap-2">
          {hasMarkdown && (
            <DownloadButton jobId={jobId} format="md" fileName="result" />
          )}
          {hasJson && (
            <DownloadButton jobId={jobId} format="json" fileName="result" />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {hasMarkdown && hasJson && (
          <Tabs defaultValue={defaultTab}>
            <TabsList>
              <TabsTrigger value="markdown">Markdown</TabsTrigger>
              <TabsTrigger value="json">JSON</TabsTrigger>
            </TabsList>
            <TabsContent value="markdown">
              <MarkdownViewer content={markdownResult} />
            </TabsContent>
            <TabsContent value="json">
              <JsonViewer data={jsonResult as object} />
            </TabsContent>
          </Tabs>
        )}
        {hasMarkdown && !hasJson && <MarkdownViewer content={markdownResult} />}
        {!hasMarkdown && hasJson && <JsonViewer data={jsonResult as object} />}
      </CardContent>
    </Card>
  );
};
