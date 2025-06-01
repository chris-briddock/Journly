"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Copy, Check, AlertTriangle, Smartphone } from "lucide-react";
import { useTwoFactorSetup, useVerifyTwoFactorSetup } from "@/hooks/use-two-factor";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import Image from "next/image";

// Verification schema
const verificationSchema = z.object({
  token: z.string()
    .min(6, "Token must be 6 digits")
    .max(6, "Token must be 6 digits")
    .regex(/^\d{6}$/, "Token must contain only numbers"),
});

type FormValues = z.infer<typeof verificationSchema>;

interface TwoFactorSetupFormProps {
  onSetupComplete: (backupCodes: string[]) => void;
  onCancel: () => void;
}

export function TwoFactorSetupForm({ onSetupComplete, onCancel }: TwoFactorSetupFormProps) {
  const [step, setStep] = useState<'setup' | 'verify'>('setup');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [currentSecret, setCurrentSecret] = useState<string>('');

  // TanStack Query hooks
  const { data: setupData, isLoading: isLoadingSetup, refetch: refetchSetup } = useTwoFactorSetup();
  const verifySetupMutation = useVerifyTwoFactorSetup();

  const form = useForm<FormValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      token: "",
    },
  });

  const handleStartSetup = async () => {
    const result = await refetchSetup();
    if (result.data) {
      setCurrentSecret(result.data.secret);
      setStep('verify');
    }
  };

  const handleCopySecret = async () => {
    if (setupData?.manualEntryKey) {
      await navigator.clipboard.writeText(setupData.manualEntryKey);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const onSubmit = async (values: FormValues) => {
    verifySetupMutation.mutate(
      {
        token: values.token,
        secret: currentSecret,
      },
      {
        onSuccess: (data) => {
          onSetupComplete(data.backupCodes);
        },
      }
    );
  };

  if (step === 'setup') {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set Up Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account by enabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You&apos;ll need an authenticator app like Google Authenticator, Authy, or 1Password to set up 2FA.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Step 1: Install an Authenticator App</h4>
              <p className="text-sm text-muted-foreground">
                Download and install an authenticator app on your mobile device if you haven&apos;t already.
              </p>
            </div>

            <div>
              <h4 className="font-medium mb-2">Step 2: Scan QR Code or Enter Secret</h4>
              <p className="text-sm text-muted-foreground">
                Click the button below to generate a QR code and secret key for your authenticator app.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleStartSetup} disabled={isLoadingSetup}>
              {isLoadingSetup ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Start Setup"
              )}
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify Two-Factor Authentication</CardTitle>
        <CardDescription>
          Scan the QR code with your authenticator app and enter the 6-digit code to complete setup.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {setupData && (
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-white rounded-lg border">
                <Image
                  src={setupData.qrCodeDataUrl}
                  alt="2FA QR Code"
                  width={192}
                  height={192}
                  className="w-48 h-48"
                />
              </div>
              
              {/* Manual Entry */}
              <div className="w-full">
                <label className="text-sm font-medium">Manual Entry Key:</label>
                <div className="flex items-center gap-2 mt-1">
                  <Input 
                    value={setupData.manualEntryKey} 
                    readOnly 
                    className="font-mono text-xs"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopySecret}
                  >
                    {copiedSecret ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* Verification Form */}
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Verification Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="000000"
                          maxLength={6}
                          className="text-center text-lg tracking-widest font-mono"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the 6-digit code from your authenticator app
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    disabled={verifySetupMutation.isPending}
                  >
                    {verifySetupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Complete Setup"
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setStep('setup')}
                  >
                    Back
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={onCancel}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
