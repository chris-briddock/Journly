import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import DashboardContent from "@/app/components/DashboardContent";
import { Metadata } from "next/types";

export const metadata: Metadata = {
  title: {
    default: "Journly",
    template: "%s | Journly",
  },
  description: "Dashboard",
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session || !session.user) {
    redirect("/login");
  }

  return <DashboardContent />;
}
