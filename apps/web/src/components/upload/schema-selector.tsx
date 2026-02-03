import { useSchemas } from "ocrbase/react";
import { useId } from "react";

import { Select } from "../ui/select";
import { Skeleton } from "../ui/skeleton";

interface SchemaSelectorProps {
  value: string | null;
  onChange: (schemaId: string | null) => void;
  disabled?: boolean;
}

export const SchemaSelector = ({
  value,
  onChange,
  disabled,
}: SchemaSelectorProps) => {
  const { data: schemas, isLoading } = useSchemas();
  const selectId = useId();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value || null);
  };

  if (isLoading) {
    return <Skeleton className="h-9 w-full" />;
  }

  return (
    <div className="space-y-2">
      <label htmlFor={selectId} className="text-sm font-medium">
        Schema <span className="text-muted-foreground">(optional)</span>
      </label>
      <Select
        id={selectId}
        value={value ?? ""}
        onChange={handleChange}
        disabled={disabled}
      >
        <option value="">No schema - extract freely</option>
        {schemas?.map((schema) => (
          <option key={schema.id} value={schema.id}>
            {schema.name}
          </option>
        ))}
      </Select>
      <p className="text-xs text-muted-foreground">
        Select a schema to extract structured data, or leave empty for free-form
        extraction.
      </p>
    </div>
  );
};
