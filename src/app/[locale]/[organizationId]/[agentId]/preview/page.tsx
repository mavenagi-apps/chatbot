import { MavenAGI } from "mavenagi";
import { setRequestLocale } from "next-intl/server";

import { getClient } from "@/lib/client.server";

import backgroundImg from "./bg.jpg";

export const revalidate = 60;
export const dynamic = "force-static";
export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{
    locale: string;
    organizationId: string;
    agentId: string;
  }>;
}) {
  const { locale, organizationId, agentId } = await params;
  setRequestLocale(locale);

  const client = getClient({ organizationId, agentId });
  const appSettings = await (async () => {
    try {
      return (await client.appSettings.get()) as unknown as AppSettings;
    } catch (e) {
      if (e instanceof MavenAGI.NotFoundError) {
        return undefined;
      }
      throw e;
    }
  })();

  if (!appSettings) {
    return (
      <main className="flex h-screen flex-col items-center justify-center gap-6 p-6">
        <div className="flex flex-col gap-6 flex-1 items-center justify-center">
          <h1 className="text-xl font-semibold tracking-tight text-balance text-gray-900 text-center">
            Chat app is not installed.
          </h1>
          <p className="text-base font-medium text-pretty text-gray-500">
            The chat app is not installed for this agent. Please install the app
            from the Maven AGI App Marketplace to enable chat functionality.
          </p>
        </div>
      </main>
    );
  }

  const envPrefix =
    !process.env.ENVIRONMENT || process.env.ENVIRONMENT === "production"
      ? ""
      : process.env.ENVIRONMENT === "sandbox"
        ? `${process.env.SANDBOX_USER}.sb.`
        : `${process.env.ENVIRONMENT}.`;

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImg.src})`,
        backgroundSize: "cover",
        height: "100vh",
      }}
    >
      <script
        dangerouslySetInnerHTML={{
          __html: `
  (function () {
    const script = document.createElement('script');
    script.src = '/widget.js';
    script.async = true;
    script.onload = () => {
      Maven.ChatWidget.load({
        envPrefix: "${envPrefix}",
        organizationId: "${organizationId}",
        agentId: "${agentId}",
        tag: "preview",
        bgColor: "${appSettings.brandColor}",
        textColor: "${appSettings.brandTitleColor}"
      });
    };
    document.head.appendChild(script);
  })();`,
        }}
      ></script>
    </div>
  );
}
