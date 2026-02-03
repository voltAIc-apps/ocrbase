import { Elysia, t } from "elysia";

import { createJobHandler, getWideEvent } from "../jobs/shared";

export const extractRoutes = new Elysia({ prefix: "/api/extract" }).post(
  "/",
  (ctx) => {
    const wideEvent = getWideEvent(ctx);
    return createJobHandler(ctx, wideEvent, { type: "extract" });
  },
  {
    body: t.Object({
      file: t.Optional(t.File()),
      hints: t.Optional(t.String()),
      schemaId: t.Optional(t.String()),
      url: t.Optional(t.String()),
    }),
    detail: {
      description: "Extract structured data from a document using a schema",
      tags: ["Extract"],
    },
  }
);
