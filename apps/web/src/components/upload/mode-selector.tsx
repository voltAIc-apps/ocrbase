import { FileText, Table } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

export type UploadMode = "parse" | "extract";

interface ModeSelectorProps {
  value: UploadMode;
  onChange: (mode: UploadMode) => void;
  disabled?: boolean;
}

export const ModeSelector = ({
  value,
  onChange,
  disabled,
}: ModeSelectorProps) => {
  const handleParseClick = useCallback(() => onChange("parse"), [onChange]);
  const handleExtractClick = useCallback(() => onChange("extract"), [onChange]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={handleParseClick}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
          value === "parse"
            ? "border-primary bg-primary/5"
            : "border-transparent bg-muted/50 hover:border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <FileText className="size-6" />
        <div className="text-center">
          <p className="text-sm font-medium">Parse</p>
          <p className="text-xs text-muted-foreground">
            Convert PDF to markdown
          </p>
        </div>
      </button>

      <button
        type="button"
        onClick={handleExtractClick}
        disabled={disabled}
        className={cn(
          "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors",
          value === "extract"
            ? "border-primary bg-primary/5"
            : "border-transparent bg-muted/50 hover:border-muted-foreground/25",
          disabled && "cursor-not-allowed opacity-50"
        )}
      >
        <Table className="size-6" />
        <div className="text-center">
          <p className="text-sm font-medium">Extract</p>
          <p className="text-xs text-muted-foreground">
            Extract structured JSON
          </p>
        </div>
      </button>
    </div>
  );
};
