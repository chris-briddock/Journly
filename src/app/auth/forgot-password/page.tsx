import type { Metadata } from "next/types";
import ForgotPasswordForm from "@/app/components/ForgotPasswordForm";

export const metadata: Metadata = {
  title: "Forgot Password | Journly",
  description: "Reset your Journly account password",
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
