import { db } from "@ocrbase/db";
import { jobs } from "@ocrbase/db/schema/jobs";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";

import {
  subscribeToJob,
  unsubscribeFromJob,
  type JobUpdateMessage,
} from "../../services/websocket";

interface WebSocketData {
  jobId: string;
  callback: (message: JobUpdateMessage) => void;
}

export const jobsWebSocket = new Elysia().ws("/ws/jobs/:jobId", {
  close(ws) {
    const { wsData } = ws.data as unknown as { wsData?: WebSocketData };

    if (wsData) {
      unsubscribeFromJob(wsData.jobId, wsData.callback);
    }
  },

  message(ws, message) {
    if (typeof message === "string") {
      try {
        const parsed = JSON.parse(message) as { type?: string };
        if (parsed.type === "ping") {
          ws.send(JSON.stringify({ type: "pong" }));
        }
      } catch {
        // Ignore invalid messages
      }
    }
  },

  async open(ws) {
    const { jobId } = ws.data.params;

    const job = await db.query.jobs.findFirst({
      where: eq(jobs.id, jobId),
    });

    if (!job) {
      ws.send(JSON.stringify({ error: "Job not found", type: "error" }));
      ws.close();
      return;
    }

    const callback = (message: JobUpdateMessage): void => {
      ws.send(JSON.stringify(message));
    };

    (ws.data as unknown as { wsData: WebSocketData }).wsData = {
      callback,
      jobId,
    };

    subscribeToJob(jobId, callback);

    ws.send(
      JSON.stringify({
        data: { status: job.status },
        jobId,
        type: "status",
      })
    );
  },
});
