import { createFileRoute } from "@tanstack/react-router";

import { UploadForm } from "@/components/upload/upload-form";

const DashboardPage = () => (
  <div className="space-y-8">
    <div>
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground">
        Upload documents to parse or extract structured data
      </p>
    </div>

    <div className="max-w-xl">
      <UploadForm />
    </div>
  </div>
);

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});
