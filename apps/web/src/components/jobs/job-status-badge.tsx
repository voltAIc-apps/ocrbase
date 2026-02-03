import { CheckCircle, Clock, Loader2, XCircle } from "lucide-react";

import { Badge } from "../ui/badge";

type JobStatus =
  | "pending"
  | "processing"
  | "extracting"
  | "completed"
  | "failed";

interface JobStatusBadgeProps {
  status: JobStatus;
}

const statusConfig: Record<
  JobStatus,
  {
    label: string;
    variant: "default" | "secondary" | "success" | "warning" | "destructive";
    icon: React.ReactNode;
  }
> = {
  completed: {
    icon: <CheckCircle className="size-3" />,
    label: "Completed",
    variant: "success",
  },
  extracting: {
    icon: <Loader2 className="size-3 animate-spin" />,
    label: "Extracting",
    variant: "warning",
  },
  failed: {
    icon: <XCircle className="size-3" />,
    label: "Failed",
    variant: "destructive",
  },
  pending: {
    icon: <Clock className="size-3" />,
    label: "Pending",
    variant: "secondary",
  },
  processing: {
    icon: <Loader2 className="size-3 animate-spin" />,
    label: "Processing",
    variant: "warning",
  },
};

export const JobStatusBadge = ({ status }: JobStatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className="gap-1">
      {config.icon}
      {config.label}
    </Badge>
  );
};
