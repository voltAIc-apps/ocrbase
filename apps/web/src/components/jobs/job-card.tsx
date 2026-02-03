import { Link } from "@tanstack/react-router";
import { FileText, Table } from "lucide-react";

import { Card, CardContent } from "../ui/card";
import { JobStatusBadge } from "./job-status-badge";

interface Job {
  id: string;
  type: "parse" | "extract";
  status: "pending" | "processing" | "extracting" | "completed" | "failed";
  fileName: string;
  fileSize: number;
  createdAt: string;
}

interface JobCardProps {
  job: Job;
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

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
};

export const JobCard = ({ job }: JobCardProps) => (
  <Link to="/jobs/$jobId" params={{ jobId: job.id }}>
    <Card className="transition-colors hover:bg-muted/50">
      <CardContent className="flex items-center gap-4 p-4">
        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
          {job.type === "parse" ? (
            <FileText className="size-5 text-muted-foreground" />
          ) : (
            <Table className="size-5 text-muted-foreground" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-medium">{job.fileName}</p>
          <p className="text-sm text-muted-foreground">
            {formatFileSize(job.fileSize)} &middot; {formatDate(job.createdAt)}
          </p>
        </div>

        <JobStatusBadge status={job.status} />
      </CardContent>
    </Card>
  </Link>
);
