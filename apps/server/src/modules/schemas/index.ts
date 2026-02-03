import { db } from "@ocrbase/db";
import { jobs } from "@ocrbase/db/schema/jobs";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";

import { SchemaModel } from "./model";
import { SchemaService } from "./service";

const PUBLIC_ORG_ID = "public";
const PUBLIC_USER_ID = "public";

const formatSchemaResponse = (schema: {
  id: string;
  organizationId: string;
  userId: string;
  name: string;
  description: string | null;
  jsonSchema: unknown;
  sampleJobId: string | null;
  generatedBy: string | null;
  usageCount: number;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  createdAt: schema.createdAt.toISOString(),
  description: schema.description,
  generatedBy: schema.generatedBy,
  id: schema.id,
  jsonSchema: schema.jsonSchema as Record<string, unknown>,
  lastUsedAt: schema.lastUsedAt?.toISOString() ?? null,
  name: schema.name,
  organizationId: schema.organizationId,
  sampleJobId: schema.sampleJobId,
  updatedAt: schema.updatedAt.toISOString(),
  usageCount: schema.usageCount,
  userId: schema.userId,
});

const getErrorMessage = (caught: unknown, fallback: string): string =>
  caught instanceof Error ? caught.message : fallback;

export const schemasRoutes = new Elysia({ prefix: "/api/schemas" })
  .post(
    "/",
    async ({ body, set }) => {
      try {
        const schema = await SchemaService.create(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID,
          body
        );

        if (!schema) {
          set.status = 500;
          return { message: "Failed to create schema" };
        }

        return formatSchemaResponse(schema);
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to create schema") };
      }
    },
    {
      body: SchemaModel.createBody,
      detail: {
        description: "Create a new extraction schema",
        tags: ["Schemas"],
      },
    }
  )
  .get(
    "/",
    async ({ set }) => {
      try {
        const schemasList = await SchemaService.list(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID
        );
        return schemasList.map(formatSchemaResponse);
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to list schemas") };
      }
    },
    {
      detail: {
        description: "List all extraction schemas",
        tags: ["Schemas"],
      },
    }
  )
  .get(
    "/:id",
    async ({ params, set }) => {
      try {
        const schema = await SchemaService.getById(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID,
          params.id
        );

        if (!schema) {
          set.status = 404;
          return { message: "Schema not found" };
        }

        return formatSchemaResponse(schema);
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to get schema") };
      }
    },
    {
      detail: {
        description: "Get schema details",
        tags: ["Schemas"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      try {
        const schema = await SchemaService.update(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID,
          params.id,
          body
        );

        if (!schema) {
          set.status = 404;
          return { message: "Schema not found" };
        }

        return formatSchemaResponse(schema);
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to update schema") };
      }
    },
    {
      body: SchemaModel.updateBody,
      detail: {
        description: "Update a schema",
        tags: ["Schemas"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      try {
        const deleted = await SchemaService.delete(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID,
          params.id
        );

        if (!deleted) {
          set.status = 404;
          return { message: "Schema not found" };
        }

        return { success: true };
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to delete schema") };
      }
    },
    {
      detail: {
        description: "Delete a schema",
        tags: ["Schemas"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .post(
    "/generate",
    async ({ body, set }) => {
      try {
        let markdown: string;
        let sampleJobId: string | undefined;

        if (body.jobId) {
          const [job] = await db
            .select()
            .from(jobs)
            .where(eq(jobs.id, body.jobId));

          if (!job) {
            set.status = 404;
            return { message: "Job not found" };
          }

          if (!job.markdownResult) {
            set.status = 400;
            return {
              message:
                "Job has not been processed yet or has no markdown result",
            };
          }

          markdown = job.markdownResult;
          sampleJobId = job.id;
        } else {
          set.status = 400;
          return {
            message:
              "Either jobId or file must be provided. File upload not yet supported.",
          };
        }

        const result = await SchemaService.generate(
          PUBLIC_ORG_ID,
          PUBLIC_USER_ID,
          markdown,
          body.hints,
          sampleJobId
        );

        return result;
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to generate schema") };
      }
    },
    {
      body: SchemaModel.generateBody,
      detail: {
        description: "Generate a schema from a parsed document using AI",
        tags: ["Schemas"],
      },
    }
  );
