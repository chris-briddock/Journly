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

  console.log('[Dashboard] Server-side auth check - Session:', session);
  console.log('[Dashboard] Server-side auth check - User:', session?.user);

  if (!session || !session.user) {
    console.log('[Dashboard] No session or user found, redirecting to login');
    redirect("/login");
  }

  console.log('[Dashboard] Session valid, rendering dashboard');

  return <DashboardContent />;
}
