import { useJobs } from "ocrbase/react";
import { useCallback, useState } from "react";

import { Button } from "../ui/button";
import { Select } from "../ui/select";
import { Skeleton } from "../ui/skeleton";
import { JobCard } from "./job-card";

type JobStatus =
  | "pending"
  | "processing"
  | "extracting"
  | "completed"
  | "failed";
type JobType = "parse" | "extract";

const SKELETON_KEYS = ["sk-1", "sk-2", "sk-3", "sk-4", "sk-5"];

export const JobList = () => {
  const [status, setStatus] = useState<JobStatus | "">("");
  const [type, setType] = useState<JobType | "">("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useJobs({
    limit: 10,
    page,
    status: status || undefined,
    type: type || undefined,
  });

  const handleStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatus(e.target.value as JobStatus | "");
      setPage(1);
    },
    []
  );

  const handleTypeChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setType(e.target.value as JobType | "");
      setPage(1);
    },
    []
  );

  const handlePreviousPage = useCallback(() => setPage((p) => p - 1), []);
  const handleNextPage = useCallback(() => setPage((p) => p + 1), []);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-32" />
        </div>
        {SKELETON_KEYS.map((key) => (
          <Skeleton key={key} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  const jobs = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4">
        <Select value={status} onChange={handleStatusChange} className="w-40">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="extracting">Extracting</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </Select>

        <Select value={type} onChange={handleTypeChange} className="w-40">
          <option value="">All types</option>
          <option value="parse">Parse</option>
          <option value="extract">Extract</option>
        </Select>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!pagination.hasPreviousPage}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={!pagination.hasNextPage}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
