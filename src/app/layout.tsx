import type { Metadata } from "next/types";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";

import "./globals.css";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { SessionProvider } from "@/app/components/SessionProvider";
import { auth } from "@/lib/auth";
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next";
import SimpleNavigation from "./components/SimpleNavigation";
import { ArticleResetCheck } from "./components/ArticleResetCheck";

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
          <SessionProvider session={session}>
            <ArticleResetCheck />
            <SimpleNavigation />
            {children}
            <Toaster position="top-right" />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
