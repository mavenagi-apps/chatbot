import { MavenAGIClient } from "mavenagi";
import { fetcher } from "mavenagi/core";

export function getBaseUrl() {
  return `https://www.${
    !process.env.ENVIRONMENT || process.env.ENVIRONMENT === "production"
      ? ""
      : process.env.ENVIRONMENT === "sandbox"
        ? `${process.env.SANDBOX_USER}.sb.`
        : `${process.env.ENVIRONMENT}.`
  }mavenagi-apis.com`;
}

export function getClient({
  organizationId,
  agentId,
}: {
  organizationId: string;
  agentId: string;
}) {
  return new MavenAGIClient({
    environment: getBaseUrl(),
    organizationId,
    agentId,
    fetcher: (args) =>
      fetcher({
        ...args,
        headers: {
          ...args.headers,
          "CF-Access-Client-Id": process.env.CF_ACCESS_CLIENT_ID,
          "CF-Access-Client-Secret": process.env.CF_ACCESS_CLIENT_SECRET,
        },
      }),
  });
}
