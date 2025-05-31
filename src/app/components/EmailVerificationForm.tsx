"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2, CheckCircle, Mail } from "lucide-react";
import { useValidateVerificationToken, useVerifyEmail } from "@/hooks/use-auth";

import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

interface EmailVerificationFormProps {
  token: string;
}

export default function EmailVerificationForm({ token }: EmailVerificationFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  // Use TanStack Query hooks
  const validateTokenQuery = useValidateVerificationToken(token);
  const verifyEmailMutation = useVerifyEmail();

  const handleVerifyEmail = () => {
    verifyEmailMutation.mutate(
      { token },
      {
        onSuccess: () => {
          setSuccess(true);

          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            router.push("/dashboard?message=email-verified");
          }, 3000);
        },
        onError: (error: Error) => {
          console.error('[EmailVerification] Verification failed:', error);
        },
      }
    );
  };

  if (validateTokenQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Validating verification token...</p>
        </div>
      </div>
    );
  }

  if (validateTokenQuery.error || (validateTokenQuery.data && !validateTokenQuery.data.valid)) {
    const errorMessage = validateTokenQuery.error?.message ||
                        validateTokenQuery.data?.error ||
                        "Invalid or expired verification token";

    return (
      <div className="space-y-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Failed
          </h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="space-y-3">
          <Button
            onClick={() => router.push("/auth/resend-verification")}
            className="w-full"
          >
            Request New Verification Email
          </Button>

          <Button
            variant="outline"
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Email Verified Successfully!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Welcome to Journly{validateTokenQuery.data?.user?.name ? `, ${validateTokenQuery.data.user.name}` : ''}! Your account is now fully activated.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to your dashboard in 3 seconds...
          </p>
        </div>

        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            You can now access all features of your Journly account, including creating posts,
            following other writers, and engaging with the community.
          </AlertDescription>
        </Alert>

        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Verify Your Email
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          {validateTokenQuery.data?.user?.name ? `Hello ${validateTokenQuery.data.user.name}! ` : ''}
          Click the button below to verify your email address and activate your account.
        </p>
        {validateTokenQuery.data?.user?.email && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Verifying: {validateTokenQuery.data.user.email}
          </p>
        )}
      </div>

      {verifyEmailMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {verifyEmailMutation.error.message || "Failed to verify email"}
          </AlertDescription>
        </Alert>
      )}

      {validateTokenQuery.data?.user?.alreadyVerified ? (
        <div className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your email address is already verified. You can sign in to your account.
            </AlertDescription>
          </Alert>

          <Button
            onClick={() => router.push("/login")}
            className="w-full"
          >
            Go to Sign In
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={handleVerifyEmail}
            disabled={verifyEmailMutation.isPending}
            className="w-full"
          >
            {verifyEmailMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying Email...
              </>
            ) : (
              "Verify Email Address"
            )}
          </Button>

          <div className="text-center text-sm text-gray-600 dark:text-gray-400">
            <p>
              Didn&apos;t receive the email?{" "}
              <button
                onClick={() => router.push("/auth/resend-verification")}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Resend verification email
              </button>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
