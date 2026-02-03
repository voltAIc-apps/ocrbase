import { db } from "@ocrbase/db";
import { env } from "@ocrbase/env/server";
import { sql } from "drizzle-orm";
import { Elysia } from "elysia";

import { checkLlmHealth } from "../../services/llm";
import { checkOcrHealth } from "../../services/ocr";
import { checkQueueHealth, getQueueCounts } from "../../services/queue";
import { checkStorageHealth } from "../../services/storage";

export interface HealthCheck {
  database: boolean;
  llm: boolean;
  ocr: boolean;
  redis: boolean;
  storage: boolean;
}

export interface HealthResponse {
  checks: HealthCheck;
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
}

const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.execute(sql`SELECT 1`);
    return true;
  } catch {
    return false;
  }
};

const determineOverallStatus = (
  checks: HealthCheck
): HealthResponse["status"] => {
  const criticalChecks = [checks.database, checks.storage];
  const allCriticalHealthy = criticalChecks.every(Boolean);

  if (!allCriticalHealthy) {
    return "unhealthy";
  }

  const allChecks = Object.values(checks);
  const allHealthy = allChecks.every(Boolean);

  return allHealthy ? "healthy" : "degraded";
};

const deriveMinioConsoleUrl = (endpoint: string | undefined): string | null => {
  if (!endpoint) {
    return null;
  }
  try {
    const url = new URL(endpoint);
    url.port = "9001";
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
};

export interface InfraResponse {
  redis: {
    url: string | null;
    queue: {
      active: number;
      completed: number;
      failed: number;
      waiting: number;
    } | null;
  };
  storage: {
    bucket: string;
    consoleUrl: string | null;
    endpoint: string | null;
  };
}

export const healthRoutes = new Elysia({ prefix: "/health" })
  .get("/live", () => ({ status: "ok" }), {
    detail: {
      description: "Liveness probe for container orchestration",
      tags: ["Health"],
    },
  })
  .get(
    "/ready",
    async (): Promise<HealthResponse> => {
      const [database, redis, storage, ocr, llm] = await Promise.all([
        checkDatabaseHealth(),
        checkQueueHealth(),
        checkStorageHealth(),
        checkOcrHealth(),
        checkLlmHealth(),
      ]);

      const checks: HealthCheck = {
        database,
        llm,
        ocr,
        redis,
        storage,
      };

      const status = determineOverallStatus(checks);

      return {
        checks,
        status,
        timestamp: new Date().toISOString(),
      };
    },
    {
      detail: {
        description: "Readiness probe with dependency health checks",
        tags: ["Health"],
      },
    }
  )
  .get(
    "/infra",
    async (): Promise<InfraResponse> => {
      const queueCounts = await getQueueCounts();

      // Mask Redis URL for display (hide password)
      let maskedRedisUrl: string | null = null;
      if (env.REDIS_URL) {
        try {
          const url = new URL(env.REDIS_URL);
          if (url.password) {
            url.password = "***";
          }
          maskedRedisUrl = url.toString();
        } catch {
          maskedRedisUrl = "[invalid url]";
        }
      }

      return {
        redis: {
          queue: queueCounts,
          url: maskedRedisUrl,
        },
        storage: {
          bucket: env.S3_BUCKET,
          consoleUrl: deriveMinioConsoleUrl(env.S3_ENDPOINT),
          endpoint: env.S3_ENDPOINT ?? null,
        },
      };
    },
    {
      detail: {
        description: "Infrastructure information for debugging",
        tags: ["Health"],
      },
    }
  );
