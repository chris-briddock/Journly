import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { SessionProvider } from "@/app/components/SessionProvider";
import { QueryProvider } from "@/app/components/providers/query-provider";
import { PollingProvider } from "@/app/components/providers/polling-provider";
import { auth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next";
import SimpleNavigation from "./components/SimpleNavigation";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Journly",
    template: "%s | Journly",
  },
  description: "A modern platform for sharing your thoughts and ideas",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en">
      <body className={inter.className}>
        <Analytics />
        <SpeedInsights />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <SessionProvider session={session}>
              <PollingProvider />
              <SimpleNavigation />
              {children}
              <Toaster position="top-right" />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
