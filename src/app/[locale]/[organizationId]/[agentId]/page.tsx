import Color from "colorjs.io";
import { setRequestLocale } from "next-intl/server";

import { getClient } from "@/lib/client.server";

import { Chat } from "./chat";

export const revalidate = 60;
export const dynamic = "force-static";
export const dynamicParams = true;

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string; organizationId: string; agentId: string }>;
}) {
  const { locale, organizationId, agentId } = await params;
  setRequestLocale(locale);
  const client = getClient({ organizationId, agentId });
  const appSettings =
    (await client.appSettings.get()) as unknown as AppSettings;
  if (!appSettings.brandColor) {
    appSettings.brandColor = "#6C2BD9";
  }
  if (!appSettings.brandFontColor) {
    appSettings.brandFontColor = "#6C2BD9";
  }
  if (!appSettings.brandTitleColor) {
    appSettings.brandTitleColor = "#ffffff";
  }

  const brandColor = appSettings.brandColor
    ? new Color(appSettings.brandColor)
    : undefined;

  return (
    <main
      className="flex h-screen flex-col"
      style={{
        // @ts-expect-error error
        "--brand-color": appSettings.brandColor,
        "--brand-font-color":
          appSettings.brandFontColor || appSettings.brandColor,
        "--brand-title-color": appSettings.brandTitleColor,
        ...(brandColor && {
          "--primary": `${brandColor.hsl[0]} ${brandColor.hsl[1]}% ${brandColor.hsl[2]}%`,
        }),
      }}
    >
      <Chat appSettings={appSettings} />
    </main>
  );
}
