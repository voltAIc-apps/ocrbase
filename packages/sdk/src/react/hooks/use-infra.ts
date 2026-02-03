import { useQuery, type UseQueryResult } from "@tanstack/react-query";

import type { InfraResponse } from "../../types";

import { useOCRBaseClient } from "../provider";

export const infraKeys = {
  all: ["infra"] as const,
};

export const useInfra = (): UseQueryResult<InfraResponse> => {
  const client = useOCRBaseClient();

  return useQuery({
    queryFn: () => client.health.infra(),
    queryKey: infraKeys.all,
  });
};
