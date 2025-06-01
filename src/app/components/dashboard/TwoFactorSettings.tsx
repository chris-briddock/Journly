"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Shield, ShieldCheck, ShieldX, Key, Loader2, AlertTriangle } from "lucide-react";
import { useDisableTwoFactor, useRegenerateBackupCodes } from "@/hooks/use-two-factor";
import { User } from "@/types/models/user";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/app/components/ui/dialog";
import { TwoFactorSetupForm } from "./TwoFactorSetupForm";
import { BackupCodesDisplay } from "./BackupCodesDisplay";

// Password validation schema
const passwordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

type PasswordFormValues = z.infer<typeof passwordSchema>;

interface TwoFactorSettingsProps {
  user: User;
}

export function TwoFactorSettings({ user }: TwoFactorSettingsProps) {
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableDialog, setShowDisableDialog] = useState(false);
  const [showRegenerateDialog, setShowRegenerateDialog] = useState(false);
  const [showBackupCodesDialog, setShowBackupCodesDialog] = useState(false);
  const [backupCodes, setBackupCodes] = useState<string[]>([]);

  // TanStack Query mutations
  const disableTwoFactorMutation = useDisableTwoFactor();
  const regenerateBackupCodesMutation = useRegenerateBackupCodes();

  const disableForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const backupCodesForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
    },
  });

  const handleSetupComplete = (codes: string[]) => {
    setBackupCodes(codes);
    setShowSetup(false);
    setShowBackupCodesDialog(true);
  };

  const handleDisable2FA = async (values: PasswordFormValues) => {
    disableTwoFactorMutation.mutate(values, {
      onSuccess: () => {
        setShowDisableDialog(false);
        disableForm.reset();
      },
    });
  };

  const handleRegenerateBackupCodes = async (values: PasswordFormValues) => {
    regenerateBackupCodesMutation.mutate(values, {
      onSuccess: (data) => {
        setBackupCodes(data.backupCodes);
        setShowRegenerateDialog(false);
        setShowBackupCodesDialog(true);
        backupCodesForm.reset();
      },
    });
  };

  if (showSetup) {
    return (
      <TwoFactorSetupForm
        onSetupComplete={handleSetupComplete}
        onCancel={() => setShowSetup(false)}
      />
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>
            Add an extra layer of security to your account with two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.twoFactorEnabled === true ? (
                <>
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                  <div>
                    <div className="font-medium">2FA Enabled</div>
                    <div className="text-sm text-muted-foreground">
                      Your account is protected with two-factor authentication
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Active
                  </Badge>
                </>
              ) : (
                <>
                  <ShieldX className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="font-medium">2FA Disabled</div>
                    <div className="text-sm text-muted-foreground">
                      Enable 2FA to secure your account
                    </div>
                  </div>
                  <Badge variant="outline">
                    Inactive
                  </Badge>
                </>
              )}
            </div>
          </div>

          {user.twoFactorEnabled !== true && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                We recommend enabling two-factor authentication to keep your account secure.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-2">
            {user.twoFactorEnabled === true ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setShowRegenerateDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Key className="h-4 w-4" />
                  Regenerate Backup Codes
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setShowDisableDialog(true)}
                >
                  Disable 2FA
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowSetup(true)}>
                Enable 2FA
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Disable 2FA Dialog */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Are you sure you want to disable 2FA? This will make your account less secure.
            </DialogDescription>
          </DialogHeader>

          <Form {...disableForm}>
            <form onSubmit={disableForm.handleSubmit(handleDisable2FA)} className="space-y-4">
              <FormField
                control={disableForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm with Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDisableDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={disableTwoFactorMutation.isPending}
                >
                  {disableTwoFactorMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Disabling...
                    </>
                  ) : (
                    "Disable 2FA"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Regenerate Backup Codes Dialog */}
      <Dialog open={showRegenerateDialog} onOpenChange={setShowRegenerateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Regenerate Backup Codes</DialogTitle>
            <DialogDescription>
              Generate new backup codes. Your old backup codes will no longer work.
            </DialogDescription>
          </DialogHeader>

          <Form {...backupCodesForm}>
            <form onSubmit={backupCodesForm.handleSubmit(handleRegenerateBackupCodes)} className="space-y-4">
              <FormField
                control={backupCodesForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm with Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRegenerateDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={regenerateBackupCodesMutation.isPending}
                >
                  {regenerateBackupCodesMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    "Generate New Codes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Display */}
      <BackupCodesDisplay
        backupCodes={backupCodes}
        isOpen={showBackupCodesDialog}
        onClose={() => setShowBackupCodesDialog(false)}
        title={user.twoFactorEnabled === true ? "New Backup Codes" : "Your Backup Codes"}
        description={
          user.twoFactorEnabled === true
            ? "Your new backup codes have been generated. Save them in a safe place."
            : "Save these backup codes in a safe place. You can use them to access your account if you lose your authenticator device."
        }
      />
    </>
  );
}
