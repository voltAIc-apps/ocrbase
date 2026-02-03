import { useInfra, useJob, useJobSubscription } from "ocrbase/react";
import { toast } from "sonner";

import { ResultViewer } from "../results/result-viewer";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { JobStatusBadge } from "./job-status-badge";

interface JobDetailProps {
  jobId: string;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const formatDuration = (ms: number | null) => {
  if (!ms) {
    return "-";
  }
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
};

const isProcessingStatus = (status: string | undefined) =>
  status === "pending" || status === "processing" || status === "extracting";

export const JobDetail = ({ jobId }: JobDetailProps) => {
  const {
    data: job,
    isLoading,
    refetch,
  } = useJob(jobId, {
    refetchInterval: (query) =>
      isProcessingStatus(query.state.data?.status) ? 1000 : false,
  });

  const isProcessing = isProcessingStatus(job?.status);

  const { data: infra } = useInfra();

  useJobSubscription(jobId, {
    enabled: isProcessing,
    onComplete: () => {
      toast.success("Job completed!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Job failed: ${error}`);
      refetch();
    },
    onStatus: (status) => {
      toast.info(`Job status: ${status}`);
      refetch();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!job) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-muted-foreground">Job not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{job.fileName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {job.type === "parse" ? "Parse" : "Extract"} job
              </p>
            </div>
            <JobStatusBadge status={job.status} />
          </div>
        </CardHeader>
        <CardContent>
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            <div>
              <dt className="text-muted-foreground">File Size</dt>
              <dd className="font-medium">{formatFileSize(job.fileSize)}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Pages</dt>
              <dd className="font-medium">{job.pageCount ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Processing Time</dt>
              <dd className="font-medium">
                {formatDuration(job.processingTimeMs)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Tokens</dt>
              <dd className="font-medium">{job.tokenCount ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Created</dt>
              <dd className="font-medium">{formatDate(job.createdAt)}</dd>
            </div>
            {job.completedAt && (
              <div>
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="font-medium">{formatDate(job.completedAt)}</dd>
              </div>
            )}
          </dl>

          {job.errorMessage && (
            <div className="mt-4 rounded-lg bg-destructive/10 p-4">
              <p className="text-sm font-medium text-destructive">Error</p>
              <p className="text-sm text-destructive/90">{job.errorMessage}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {job.status === "completed" && (
        <ResultViewer
          jobId={job.id}
          markdownResult={job.markdownResult}
          jsonResult={job.jsonResult}
          jobType={job.type}
        />
      )}

      {isProcessing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-12">
            <div className="mb-4 size-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <p className="text-muted-foreground">Processing your document...</p>
            <p className="text-sm text-muted-foreground">
              This may take a moment
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Infrastructure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.storage && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Storage</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
                <div>
                  <dt className="text-muted-foreground">Bucket</dt>
                  <dd className="font-mono text-xs">{job.storage.bucket}</dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-muted-foreground">Key</dt>
                  <dd className="truncate font-mono text-xs">
                    {job.storage.key}
                  </dd>
                </div>
              </dl>
              {infra?.storage.consoleUrl && (
                <a
                  href={`${infra.storage.consoleUrl}/browser/${job.storage.bucket}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-xs text-blue-600 hover:underline"
                >
                  Open in MinIO Console
                </a>
              )}
            </div>
          )}

          {infra?.redis.queue && (
            <div>
              <h4 className="mb-2 text-sm font-medium">Queue</h4>
              <dl className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                <div>
                  <dt className="text-muted-foreground">Waiting</dt>
                  <dd className="font-medium">{infra.redis.queue.waiting}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Active</dt>
                  <dd className="font-medium">{infra.redis.queue.active}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Completed</dt>
                  <dd className="font-medium">{infra.redis.queue.completed}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Failed</dt>
                  <dd className="font-medium">{infra.redis.queue.failed}</dd>
                </div>
              </dl>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
