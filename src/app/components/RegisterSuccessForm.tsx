"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Mail, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useResendVerification } from "@/hooks/use-auth";

import { Button } from "@/app/components/ui/button";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

export default function RegisterSuccessForm() {
  const [userEmail, setUserEmail] = useState<string>("");
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  // Use TanStack Query mutation for resend verification
  const resendVerificationMutation = useResendVerification();

  // Get email from sessionStorage if available
  useEffect(() => {
    const registeredEmail = sessionStorage.getItem("registered_email");
    if (registeredEmail) {
      setUserEmail(registeredEmail);
      // Keep the email in sessionStorage for potential resend
    }
  }, []);

  const handleResendVerification = () => {
    if (!userEmail) return;

    resendVerificationMutation.mutate(
      { email: userEmail },
      {
        onSuccess: () => {
          setShowResendSuccess(true);
          // Hide success message after 5 seconds
          setTimeout(() => setShowResendSuccess(false), 5000);
        },
        onError: (error: Error) => {
          console.error('[RegisterSuccess] Resend verification failed:', error);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Account Created Successfully!
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Welcome to Journly! We&apos;re excited to have you join our community.
        </p>
      </div>

      <Alert>
        <Mail className="h-4 w-4" />
        <AlertDescription>
          <strong>Please verify your email address</strong>
          <br />
          We&apos;ve sent a verification link to{" "}
          {userEmail && (
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {userEmail}
            </span>
          )}
          {!userEmail && "your email address"}. 
          Click the link in the email to activate your account and start using Journly.
        </AlertDescription>
      </Alert>

      {showResendSuccess && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            Verification email sent successfully! Please check your inbox.
          </AlertDescription>
        </Alert>
      )}

      {resendVerificationMutation.error && (
        <Alert variant="destructive">
          <AlertDescription>
            {resendVerificationMutation.error.message || "Failed to resend verification email"}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            What&apos;s next?
          </h3>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Check your email inbox for the verification link</li>
            <li>• Click the link to verify your email address</li>
            <li>• Sign in to start creating and sharing your content</li>
          </ul>
        </div>

        <div className="space-y-3">
          {userEmail && (
            <Button
              onClick={handleResendVerification}
              disabled={resendVerificationMutation.isPending}
              variant="outline"
              className="w-full"
            >
              {resendVerificationMutation.isPending ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Resend Verification Email
                </>
              )}
            </Button>
          )}

          <Button asChild className="w-full">
            <Link href="/login">
              Continue to Sign In
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p>
          Didn&apos;t receive the email? Check your spam folder or{" "}
          <Link 
            href="/auth/resend-verification" 
            className="text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            request a new verification email
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
