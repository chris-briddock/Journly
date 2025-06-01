"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Shield, Key } from "lucide-react";
import { signIn } from "next-auth/react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Alert, AlertDescription } from "@/app/components/ui/alert";

// Verification schema
const verificationSchema = z.object({
  token: z.string().min(1, "Verification code is required"),
});

type FormValues = z.infer<typeof verificationSchema>;

interface TwoFactorVerificationFormProps {
  userId: string;
  email: string;
  password: string;
  onVerificationSuccess: () => void;
  onCancel: () => void;
}

export function TwoFactorVerificationForm({
  email,
  password,
  onVerificationSuccess,
  onCancel
}: TwoFactorVerificationFormProps) {
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      token: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");
    setIsLoading(true);

    try {
      // Complete the sign-in process with 2FA token
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        twoFactorToken: values.token,
      });

      if (result?.error) {
        setError(result.error);
        form.setFocus("token");
      } else {
        onVerificationSuccess();
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBackupCode = () => {
    setUseBackupCode(!useBackupCode);
    form.reset();
    setError("");
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          {useBackupCode 
            ? "Enter one of your backup codes to continue"
            : "Enter the 6-digit code from your authenticator app"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="token"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {useBackupCode ? "Backup Code" : "Verification Code"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={useBackupCode ? "Enter backup code" : "000000"}
                      maxLength={useBackupCode ? 8 : 6}
                      className={`text-center text-lg tracking-widest font-mono ${
                        useBackupCode ? "" : "uppercase"
                      }`}
                      autoComplete="off"
                    />
                  </FormControl>
                  <FormDescription>
                    {useBackupCode 
                      ? "Enter one of your 8-character backup codes"
                      : "Enter the 6-digit code from your authenticator app"
                    }
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={toggleBackupCode}
              >
                {useBackupCode ? (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Use Authenticator Code
                  </>
                ) : (
                  <>
                    <Key className="mr-2 h-4 w-4" />
                    Use Backup Code
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={onCancel}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
