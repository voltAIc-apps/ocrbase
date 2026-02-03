# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

- **Package manager**: bun (Turborepo workspaces)
- **Frontend**: `apps/web/` - TanStack Start
- **Backend**: `apps/server/` - Elysia
- **Auth**: Better Auth (`packages/auth/`)
- **DB**: Drizzle + Turso (`packages/db/`)
- **Queue**: BullMQ + Redis for async job processing
- **SDK**: Published npm package (`packages/sdk/`) with React hooks

## Commands

- `bun x ultracite fix` - Format/lint code
- `bun check-types` - Type check

Note: Developer always has `bun dev` running in a separate terminal.

For database operations, see .claude/docs/DATABASE.md
For git workflow, see .claude/docs/GIT.md
For TypeScript conventions, see .claude/docs/TYPESCRIPT.md

## Architecture

### Server (`apps/server/`)

Elysia app with modular structure:

- `src/modules/` - Route modules (auth, parse, extract, jobs, keys, schemas)
  - Each module typically has: `index.ts` (routes), `service.ts` (business logic), `model.ts` (TypeBox validation)
- `src/workers/job.worker.ts` - BullMQ worker for async OCR processing (runs separately via `dev:worker`)
- `src/services/` - Shared services (storage, queue, ocr, llm)
- `src/plugins/` - Elysia plugins (errorHandler, rateLimit, security)

### Job Processing Flow

1. Client submits file → API creates job record with `pending` status
2. Job queued to BullMQ → Worker picks up job
3. Worker: download file → OCR parse → (optional) LLM extraction → complete
4. Client receives updates via WebSocket subscription (`modules/jobs/websocket.ts`)

### SDK (`packages/sdk/`)

- Eden-based client wrapping server API
- Exports `createClient()` for Node.js and `ocrbase/react` for React hooks
- React integration uses TanStack Query

### Auth (`packages/auth/`)

Better Auth with organization plugin. Auto-creates personal org on signup. API key auth for SDK clients.

## Plan Mode

- Make plans extremely concise. Sacrifice grammar for concision.
- End each plan with unresolved questions, if any.

## Tracer Bullets

When building features, build a tiny end-to-end slice first, seek feedback, then expand.
