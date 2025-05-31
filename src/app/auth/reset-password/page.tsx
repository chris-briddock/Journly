import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import ResetPasswordForm from "@/app/components/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Reset Password | Journly",
  description: "Reset your Journly account password",
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/auth/forgot-password");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">

        <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8">
          <ResetPasswordForm token={token} />
        </div>
      </div>
    </div>
  );
}
