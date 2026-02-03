import { FileUp, X } from "lucide-react";
import { useCallback, useState, type DragEvent } from "react";

import { cn } from "@/lib/utils";

import { Button } from "../ui/button";

interface FileDropzoneProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export const FileDropzone = ({
  value,
  onChange,
  accept = ".pdf",
  maxSize = 50 * 1024 * 1024,
  disabled,
}: FileDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (
        accept &&
        !accept.split(",").some((type) => file.name.endsWith(type.trim()))
      ) {
        return `Invalid file type. Accepted: ${accept}`;
      }
      if (file.size > maxSize) {
        return `File too large. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`;
      }
      return null;
    },
    [accept, maxSize]
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      onChange(file);
    },
    [onChange, validateFile]
  );

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        handleFile(file);
      }
    },
    [handleFile]
  );

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (value) {
    return (
      <div className="rounded-lg border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <FileUp className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">{value.name}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(value.size)}
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onChange(null)}
            disabled={disabled}
          >
            <X className="size-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <label
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-50"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="sr-only"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
        />
        <FileUp className="mb-2 size-10 text-muted-foreground" />
        <p className="text-sm font-medium">
          Drop your PDF here, or <span className="text-primary">browse</span>
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF files up to {Math.round(maxSize / 1024 / 1024)}MB
        </p>
      </label>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
    </div>
  );
};
