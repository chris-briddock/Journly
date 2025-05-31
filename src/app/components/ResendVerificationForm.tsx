"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, CheckCircle, Mail, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useResendVerification } from "@/hooks/use-auth";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

const resendVerificationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type FormValues = z.infer<typeof resendVerificationSchema>;

export default function ResendVerificationForm() {
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showEmailVerificationMessage, setShowEmailVerificationMessage] = useState(false);

  // Use TanStack Query mutation for resend verification
  const resendVerificationMutation = useResendVerification();

  const form = useForm<FormValues>({
    resolver: zodResolver(resendVerificationSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  // Pre-populate email from sessionStorage if available
  useEffect(() => {
    const unverifiedEmail = sessionStorage.getItem("unverified_email");
    if (unverifiedEmail) {
      form.setValue("email", unverifiedEmail);
      setShowEmailVerificationMessage(true);
      // Clear it from sessionStorage after using it
      sessionStorage.removeItem("unverified_email");
    }
  }, [form]);

  const onSubmit = (values: FormValues) => {
    resendVerificationMutation.mutate(values, {
      onSuccess: (data) => {
        setSuccess(true);
        setSuccessMessage(data.message || "Verification email sent successfully!");
        form.reset();
      },
      onError: (error: Error) => {
        console.error('[ResendVerification] Request failed:', error);
      },
    });
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verification Email Sent!
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {successMessage}
          </p>
        </div>

        <Alert>
          <Mail className="h-4 w-4" />
          <AlertDescription>
            Please check your email inbox and click the verification link to activate your account.
            Don&apos;t forget to check your spam folder if you don&apos;t see the email.
          </AlertDescription>
        </Alert>

        <div className="text-center space-y-3">
          <Button
            onClick={() => {
              setSuccess(false);
              setSuccessMessage("");
            }}
            variant="outline"
            className="w-full"
          >
            Send Another Email
          </Button>

          <Button
            variant="ghost"
            asChild
            className="w-full"
          >
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <Mail className="mx-auto h-12 w-12 text-blue-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Resend Email Verification
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a new verification link.
        </p>
      </div>

      {showEmailVerificationMessage && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Your email address needs to be verified before you can sign in.
            Please check your email for a verification link, or request a new one below.
          </AlertDescription>
        </Alert>
      )}

      {resendVerificationMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {resendVerificationMutation.error.message || "Failed to send verification email"}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={resendVerificationMutation.isPending}
          >
            {resendVerificationMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Verification Email...
              </>
            ) : (
              "Send Verification Email"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button variant="ghost" asChild>
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </div>
    </div>
  );
}
