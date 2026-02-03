import type { EdenClient } from "../client";
import type { HealthResponse, InfraResponse, LiveResponse } from "../types";

import { SDKError } from "../errors";

export interface HealthClient {
  /** Get infrastructure information (Redis queue counts, storage details) */
  infra: () => Promise<InfraResponse>;
  /** Check if the server is alive (basic health check) */
  live: () => Promise<LiveResponse>;
  /** Check if the server is ready (full dependency check) */
  ready: () => Promise<HealthResponse>;
}

export const createHealthClient = (eden: EdenClient): HealthClient => ({
  infra: async () => {
    const { data, error } = await eden.health.infra.get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as InfraResponse;
  },

  live: async () => {
    const { data, error } = await eden.health.live.get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as LiveResponse;
  },

  ready: async () => {
    const { data, error } = await eden.health.ready.get();

    if (error) {
      throw SDKError.fromEdenError(error);
    }

    return data as HealthResponse;
  },
});
