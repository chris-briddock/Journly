"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useForgotPassword } from "@/hooks/use-auth";

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

// Define validation schema
const forgotPasswordSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
    .toLowerCase()
    .trim(),
});

type FormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordForm() {
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // Use TanStack Query mutation for password reset request
  const forgotPasswordMutation = useForgotPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (values: FormValues) => {
    forgotPasswordMutation.mutate(values, {
      onSuccess: (data) => {
        setSuccess(true);
        setSuccessMessage(data.message || "Password reset email sent successfully!");
        form.reset();
      },
      onError: (error: Error) => {
        // Error handling is done in the component render
        console.error('[ForgotPassword] Request failed:', error);
      },
    });
  };

  if (success) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Check Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {successMessage}
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If you don&apos;t see the email in your inbox, please check your spam folder.
            The reset link will expire in 1 hour for security reasons.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <Button asChild variant="outline" className="w-full">
            <Link href="/login">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setSuccess(false);
              setSuccessMessage("");
              form.reset();
            }}
          >
            Send Another Reset Email
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Forgot Your Password?
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>
      </div>

      {forgotPasswordMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {forgotPasswordMutation.error.message || "Failed to send password reset email"}
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
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    type="email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={forgotPasswordMutation.isPending}>
            {forgotPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending Reset Email...
              </>
            ) : (
              "Send Reset Email"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center">
        <Button asChild variant="ghost">
          <Link href="/login">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </div>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign up here
          </Link>
        </p>
      </div>
    </div>
  );
}
