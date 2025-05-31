import type { Metadata } from "next/types";
import { redirect } from "next/navigation";
import EmailVerificationForm from "@/app/components/EmailVerificationForm";

export const metadata: Metadata = {
  title: "Verify Email | Journly",
  description: "Verify your Journly account email address",
};

interface VerifyEmailPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: VerifyEmailPageProps) {
  const params = await searchParams;
  const token = params.token;

  if (!token) {
    redirect("/auth/resend-verification");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8">
          <EmailVerificationForm token={token} />
        </div>
      </div>
    </div>
  );
}
