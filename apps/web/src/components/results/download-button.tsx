import { Download, Loader2 } from "lucide-react";
import { useDownloadJob } from "ocrbase/react";
import { useCallback } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";

interface DownloadButtonProps {
  jobId: string;
  format: "md" | "json";
  fileName: string;
}

export const DownloadButton = ({
  jobId,
  format,
  fileName,
}: DownloadButtonProps) => {
  const downloadMutation = useDownloadJob();

  const handleDownload = useCallback(async () => {
    try {
      const content = await downloadMutation.mutateAsync({ format, id: jobId });

      const blob = new Blob([content], {
        type: format === "md" ? "text/markdown" : "application/json",
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${fileName}.${format}`;
      document.body.append(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      toast.success(`Downloaded ${fileName}.${format}`);
    } catch {
      toast.error("Failed to download file");
    }
  }, [downloadMutation, format, jobId, fileName]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={downloadMutation.isPending}
    >
      {downloadMutation.isPending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <Download className="size-4" />
      )}
      {format.toUpperCase()}
    </Button>
  );
};
