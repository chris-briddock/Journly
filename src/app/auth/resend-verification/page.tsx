import type { Metadata } from "next/types";
import ResendVerificationForm from "@/app/components/ResendVerificationForm";

export const metadata: Metadata = {
  title: "Resend Email Verification | Journly",
  description: "Resend your email verification link",
};

export default function ResendVerificationPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8">
          <ResendVerificationForm />
        </div>
      </div>
    </div>
  );
}
