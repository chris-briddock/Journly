"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { useValidateResetToken, useResetPassword } from "@/hooks/use-auth";

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
const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, "Password must be at least 8 characters long")
    .max(128, "Password must be less than 128 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number"
    ),
  confirmPassword: z.string()
    .min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type FormValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const router = useRouter();
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Use TanStack Query hooks
  const validateTokenQuery = useValidateResetToken(token);
  const resetPasswordMutation = useResetPassword();

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
    mode: "onBlur",
  });

  const onSubmit = (values: FormValues) => {
    resetPasswordMutation.mutate(
      {
        token,
        password: values.password,
        confirmPassword: values.confirmPassword,
      },
      {
        onSuccess: () => {
          setSuccess(true);
          form.reset();

          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push("/login?message=password-reset-success");
          }, 3000);
        },
        onError: (error: Error) => {
          console.error('[ResetPassword] Reset failed:', error);
        },
      }
    );
  };

  if (validateTokenQuery.isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Validating reset token...</p>
        </div>
      </div>
    );
  }

  if (validateTokenQuery.error || (validateTokenQuery.data && !validateTokenQuery.data.valid)) {
    const errorMessage = validateTokenQuery.error?.message ||
                        validateTokenQuery.data?.error ||
                        "Invalid or expired reset token";

    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>

        <div className="text-center">
          <Button
            onClick={() => router.push("/auth/forgot-password")}
            className="w-full"
          >
            Request New Password Reset
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
            Password Reset Successful!
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Your password has been reset successfully. You can now sign in with your new password.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Redirecting to sign in page in 3 seconds...
          </p>
        </div>

        <Button
          onClick={() => router.push("/login")}
          className="w-full"
        >
          Go to Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Reset Your Password
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
      </div>

      {resetPasswordMutation.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {resetPasswordMutation.error.message || "Failed to reset password"}
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your new password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm New Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your new password"
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={resetPasswordMutation.isPending}>
            {resetPasswordMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting Password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          Remember your password?{" "}
          <button
            onClick={() => router.push("/login")}
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign in here
          </button>
        </p>
      </div>
    </div>
  );
}
