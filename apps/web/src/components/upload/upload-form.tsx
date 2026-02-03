import { useNavigate } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useExtract, useParse } from "ocrbase/react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { FileDropzone } from "./file-dropzone";
import { ModeSelector, type UploadMode } from "./mode-selector";
import { SchemaSelector } from "./schema-selector";

export const UploadForm = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<UploadMode>("parse");
  const [schemaId, setSchemaId] = useState<string | null>(null);
  const [hints, setHints] = useState("");

  const parseMutation = useParse();
  const extractMutation = useExtract();

  const isLoading = parseMutation.isPending || extractMutation.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      toast.error("Please select a file");
      return;
    }

    try {
      let job;
      if (mode === "parse") {
        job = await parseMutation.mutateAsync({ file });
      } else {
        job = await extractMutation.mutateAsync({
          file,
          hints: hints || undefined,
          schemaId: schemaId ?? undefined,
        });
      }

      toast.success("Job created successfully");
      navigate({ params: { jobId: job.id }, to: "/jobs/$jobId" });
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to create job"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload Document</CardTitle>
        <CardDescription>
          Upload a PDF to parse or extract structured data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <FileDropzone value={file} onChange={setFile} disabled={isLoading} />

          <ModeSelector value={mode} onChange={setMode} disabled={isLoading} />

          {mode === "extract" && (
            <>
              <SchemaSelector
                value={schemaId}
                onChange={setSchemaId}
                disabled={isLoading}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Hints{" "}
                  <span className="text-muted-foreground">(optional)</span>
                </label>
                <Input
                  value={hints}
                  onChange={(e) => setHints(e.target.value)}
                  placeholder="e.g., Focus on invoice details, dates, and amounts"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Provide hints to guide the extraction process.
                </p>
              </div>
            </>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!file || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Processing...
              </>
            ) : (
              `${mode === "parse" ? "Parse" : "Extract"} Document`
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
