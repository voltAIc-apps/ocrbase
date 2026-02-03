import { Elysia, t } from "elysia";

import { JobService } from "./service";
import { formatJobResponse, getErrorMessage, getWideEvent } from "./shared";

const PUBLIC_ORG_ID = "public";

export const jobsRoutes = new Elysia({ prefix: "/api/jobs" })
  .get(
    "/",
    async ({ query, set }) => {
      try {
        const result = await JobService.list(PUBLIC_ORG_ID, PUBLIC_ORG_ID, {
          limit: query.limit,
          page: query.page,
          sortBy: query.sortBy,
          sortOrder: query.sortOrder,
          status: query.status,
          type: query.type,
        });

        return {
          data: result.data.map(formatJobResponse),
          pagination: result.pagination,
        };
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to list jobs") };
      }
    },
    {
      detail: {
        description: "List jobs with filtering, sorting, and pagination",
        tags: ["Jobs"],
      },
      query: t.Object({
        limit: t.Optional(t.Numeric({ default: 20, maximum: 100, minimum: 1 })),
        page: t.Optional(t.Numeric({ default: 1, minimum: 1 })),
        sortBy: t.Optional(
          t.Union([t.Literal("createdAt"), t.Literal("updatedAt")])
        ),
        sortOrder: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")])),
        status: t.Optional(
          t.Union([
            t.Literal("pending"),
            t.Literal("processing"),
            t.Literal("extracting"),
            t.Literal("completed"),
            t.Literal("failed"),
          ])
        ),
        type: t.Optional(t.Union([t.Literal("parse"), t.Literal("extract")])),
      }),
    }
  )
  .get(
    "/:id",
    async (ctx) => {
      const { params, set } = ctx;
      const wideEvent = getWideEvent(ctx);

      try {
        const job = await JobService.getById(
          PUBLIC_ORG_ID,
          PUBLIC_ORG_ID,
          params.id
        );

        if (!job) {
          set.status = 404;
          return { message: "Job not found" };
        }

        wideEvent?.setJob({
          id: job.id,
          pageCount: job.pageCount ?? undefined,
          status: job.status,
          type: job.type,
        });

        return formatJobResponse(job);
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to get job") };
      }
    },
    {
      detail: {
        description: "Get job details and status",
        tags: ["Jobs"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .delete(
    "/:id",
    async (ctx) => {
      const { params, set } = ctx;
      const wideEvent = getWideEvent(ctx);

      try {
        const job = await JobService.getById(
          PUBLIC_ORG_ID,
          PUBLIC_ORG_ID,
          params.id
        );

        if (!job) {
          set.status = 404;
          return { message: "Job not found" };
        }

        wideEvent?.setJob({ id: job.id, type: job.type });

        await JobService.delete(PUBLIC_ORG_ID, PUBLIC_ORG_ID, params.id);

        return { message: "Job deleted successfully" };
      } catch (error) {
        set.status = 500;
        return { message: getErrorMessage(error, "Failed to delete job") };
      }
    },
    {
      detail: {
        description: "Delete a job and its associated data",
        tags: ["Jobs"],
      },
      params: t.Object({
        id: t.String(),
      }),
    }
  )
  .get(
    "/:id/download",
    async (ctx) => {
      const { params, query, set } = ctx;
      const wideEvent = getWideEvent(ctx);

      try {
        const format = query.format ?? "md";
        const { content, contentType, fileName } =
          await JobService.getDownloadContent(
            PUBLIC_ORG_ID,
            PUBLIC_ORG_ID,
            params.id,
            format
          );

        wideEvent?.setJob({ id: params.id });

        set.headers["Content-Type"] = contentType;
        set.headers["Content-Disposition"] =
          `attachment; filename="${fileName}"`;

        return content;
      } catch (error) {
        set.status = 500;
        return {
          message: getErrorMessage(error, "Failed to download job result"),
        };
      }
    },
    {
      detail: {
        description: "Download job result as markdown or JSON",
        tags: ["Jobs"],
      },
      params: t.Object({
        id: t.String(),
      }),
      query: t.Object({
        format: t.Optional(t.Union([t.Literal("md"), t.Literal("json")])),
      }),
    }
  );
