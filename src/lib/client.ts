"use client";

import { MavenAGIClient } from "mavenagi";
import { useParams } from "next/navigation";

export function useMavenAGIClient() {
  const { organizationId, agentId } = useParams<{
    organizationId: string;
    agentId: string;
  }>();

  return new MavenAGIClient({
    organizationId,
    agentId,
    environment: "/api",
  });
}
