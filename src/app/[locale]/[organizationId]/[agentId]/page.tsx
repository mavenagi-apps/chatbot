import Color from "colorjs.io";
import { MavenAGI } from "mavenagi";
import { getTranslations, setRequestLocale } from "next-intl/server";
import Image from "next/image";

import { getClient } from "@/lib/client.server";

import { Chat } from "./chat";
import logoLight from "./mavenagi_logo_light.svg";

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
  const t = await getTranslations("chat.ChatPage");

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
            An error occurred in the application. If you are the owner of this
            page, please make sure the Chat app is installed for your agent.
          </p>
        </div>
        <div className="mx-auto flex items-center text-xs text-gray-400 justify-self-end self-end place-self-end">
          {t("powered_by")}{" "}
          <a
            href="https://www.mavenagi.com"
            target="_blank"
            rel="noreferrer noopener"
          >
            <Image
              alt="Maven AGI"
              src={logoLight}
              className="ml-1 h-6"
              width={82}
              height={24}
            />
          </a>
        </div>
      </main>
    );
  }

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
