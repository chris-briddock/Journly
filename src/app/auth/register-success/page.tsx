import type { Metadata } from "next/types";
import RegisterSuccessForm from "@/app/components/RegisterSuccessForm";

export const metadata: Metadata = {
  title: "Registration Successful | Journly",
  description: "Your account has been created successfully. Please verify your email to continue.",
};

export default function RegisterSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white dark:bg-background shadow-lg rounded-lg p-8">
          <RegisterSuccessForm />
        </div>
      </div>
    </div>
  );
}
