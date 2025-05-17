import { Suspense } from "react";
import type { Metadata } from "next/types";
import { DashboardHeader } from "@/app/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/app/components/dashboard/DashboardShell";
import { ReadingHistoryList } from "@/app/components/dashboard/ReadingHistoryList";
import { ReadingHistorySkeleton } from "@/app/components/dashboard/ReadingHistorySkeleton";
import SimpleNavigation from "@/app/components/SimpleNavigation";

export const metadata: Metadata = {
  title: "Reading History - Journly Dashboard",
  description: "View your reading history",
};

export default function ReadingHistoryPage() {
  return (
    <>
      <SimpleNavigation />
      <DashboardShell>
        <DashboardHeader
          heading="Reading History"
          text="View and manage your reading history"
        />
        <Suspense fallback={<ReadingHistorySkeleton />}>
          <ReadingHistoryList />
        </Suspense>
      </DashboardShell>
    </>
  );
}
