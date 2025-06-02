"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, getProviders } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertCircle, Loader2, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useResendVerification } from "@/hooks/use-auth";
import { TwoFactorVerificationForm } from "@/app/components/auth/TwoFactorVerificationForm";
import { GoogleIcon } from "@/app/components/icons/Google";

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

// Define validation schema
const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
});

type FormValues = z.infer<typeof loginSchema>;

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

interface LoginFormProps {
  from?: string;
}

export default function LoginForm({ from }: LoginFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);
  const [isEmailNotVerified, setIsEmailNotVerified] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [twoFactorUserId, setTwoFactorUserId] = useState("");
  const [twoFactorCredentials, setTwoFactorCredentials] = useState({ email: "", password: "" });

  // Use TanStack Query mutation for resend verification
  const resendVerificationMutation = useResendVerification();

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    loadProviders();
  }, []);

  const form = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setError("");
    setIsEmailNotVerified(false);
    setResendSuccess(false);
    setShowTwoFactor(false);

    try {
      // First, check if the user requires 2FA
      const checkResponse = await fetch('/api/auth/check-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: values.email,
          password: values.password
        }),
      });

      if (!checkResponse.ok) {
        const errorData = await checkResponse.json();

        // Handle email verification error
        if (errorData.error === "EMAIL_NOT_VERIFIED" || errorData.requiresEmailVerification) {
          setIsEmailNotVerified(true);
          setUnverifiedEmail(values.email);
          setError("Your email address is not verified. Please check your email for a verification link or resend a new one below.");
          return;
        }

        // Handle other errors (invalid credentials, etc.)
        setError(errorData.error || "Login failed");
        return;
      }

      const userData = await checkResponse.json();

      // If user requires 2FA, show the 2FA form
      if (userData.requires2FA) {
        setTwoFactorUserId(userData.userId);
        setTwoFactorCredentials({ email: values.email, password: values.password });
        setShowTwoFactor(true);
        return;
      }

      // If no 2FA required, proceed with normal sign-in
      const result = await signIn("credentials", {
        redirect: false,
        email: values.email,
        password: values.password,
      });

      if (result?.error) {
        console.log('[LoginForm] NextAuth error:', result.error);
        setError(result.error);
        return;
      }

      // Redirect to the intended page or dashboard
      const redirectTo = from && from !== '/login' ? from : '/dashboard';
      console.log(`[LoginForm] Login successful, redirecting to: ${redirectTo}`);
      router.push(redirectTo);
      router.refresh();
    } catch (error) {
      console.error('[LoginForm] Login error:', error);
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = () => {
    if (!unverifiedEmail) return;

    resendVerificationMutation.mutate(
      { email: unverifiedEmail },
      {
        onSuccess: () => {
          setResendSuccess(true);
          // Hide success message after 5 seconds
          setTimeout(() => setResendSuccess(false), 5000);
        },
        onError: (error: Error) => {
          console.error('[Login] Resend verification failed:', error);
        },
      }
    );
  };

  const handleTwoFactorSuccess = () => {
    // After successful 2FA verification, redirect to dashboard
    const redirectTo = from && from !== '/login' ? from : '/dashboard';
    console.log(`[LoginForm] 2FA verification successful, redirecting to: ${redirectTo}`);
    router.push(redirectTo);
    router.refresh();
  };

  const handleTwoFactorCancel = () => {
    setShowTwoFactor(false);
    setTwoFactorUserId("");
    setError("");
  };

  // Show 2FA verification form if needed
  if (showTwoFactor && twoFactorUserId) {
    return (
      <TwoFactorVerificationForm
        userId={twoFactorUserId}
        email={twoFactorCredentials.email}
        password={twoFactorCredentials.password}
        onVerificationSuccess={handleTwoFactorSuccess}
        onCancel={handleTwoFactorCancel}
      />
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {isEmailNotVerified ? "Email Not Verified" : "Login Failed"}
              </p>
            </div>
          </div>

          {isEmailNotVerified && (
            <div className="space-y-3">
              {resendSuccess && (
                <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-900/20 p-3 text-green-700 dark:text-green-300">
                  <Mail className="h-4 w-4" />
                  <p className="text-sm">Verification email sent successfully! Please check your inbox.</p>
                </div>
              )}

              {resendVerificationMutation.error && (
                <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-sm">
                    {resendVerificationMutation.error.message || "Failed to resend verification email"}
                  </p>
                </div>
              )}

              <div className="flex gap-2">
                <Button
                  onClick={handleResendVerification}
                  disabled={resendVerificationMutation.isPending}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  {resendVerificationMutation.isPending ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Resend Email
                    </>
                  )}
                </Button>

                <Button
                  onClick={() => router.push("/auth/resend-verification")}
                  variant="ghost"
                  size="sm"
                  className="flex-1"
                >
                  Go to Verification Page
                </Button>
              </div>
            </div>
          )}
        </div>
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
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-end">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot your password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>
      </Form>

      {providers && Object.values(providers).filter((provider) => provider.id !== "credentials").length > 0 && (
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
      )}

      {providers && Object.values(providers)
        .filter((provider) => provider.id !== "credentials")
        .map((provider) => {
          const callbackUrl = from && from !== '/login' ? from : '/dashboard';
          const isGoogle = provider.id === 'google';

          return (
            <Button
              key={provider.id}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              onClick={() => signIn(provider.id, { callbackUrl })}
            >
              {isGoogle && <GoogleIcon className="w-5 h-5" />}
              <span>Sign in with {provider.name}</span>
            </Button>
          );
        })}
    </div>
  );
}
