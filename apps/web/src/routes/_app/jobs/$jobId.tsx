import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { JobDetail } from "@/components/jobs/job-detail";
import { Button } from "@/components/ui/button";

const JobDetailPage = () => {
  const { jobId } = Route.useParams();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/jobs">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Job Details</h1>
          <p className="text-sm text-muted-foreground">{jobId}</p>
        </div>
      </div>

      <JobDetail jobId={jobId} />
    </div>
  );
};

export const Route = createFileRoute("/_app/jobs/$jobId")({
  component: JobDetailPage,
});
