import { createFileRoute } from "@tanstack/react-router";

import { JobList } from "@/components/jobs/job-list";

const JobsPage = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-2xl font-bold">Jobs</h1>
      <p className="text-muted-foreground">
        View and manage your document processing jobs
      </p>
    </div>

    <JobList />
  </div>
);

export const Route = createFileRoute("/_app/jobs/")({
  component: JobsPage,
});
