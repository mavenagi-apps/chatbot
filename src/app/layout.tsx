import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Noto_Sans } from "next/font/google";

import { Toaster } from "@/components/ui/sonner";

import { Providers } from "./providers";

import "./globals.css";

import { cn } from "@/lib/utils";

const font = Noto_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Chat",
  description: "Chat powered by Maven AGI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body className={cn(font.className, "antialiased")}>
        <Providers>{children}</Providers>
        <Toaster richColors />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
