"use client";

import { format } from "date-fns";
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Settings
} from "lucide-react";
import { 
  useSecuritySettings, 
  useUpdateSecuritySettings,
  type SecuritySettings as SecuritySettingsType 
} from "@/hooks/use-sessions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { Switch } from "@/app/components/ui/switch";
import { Label } from "@/app/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface SecurityOverviewProps {
  settings: SecuritySettingsType;
}

function SecurityOverview({ settings }: SecurityOverviewProps) {
  const securityScore = calculateSecurityScore(settings);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Shield className="h-5 w-5" />
          <span>Security Overview</span>
        </CardTitle>
        <CardDescription>
          Your account security status and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Security Score</span>
          <div className="flex items-center space-x-2">
            <div className={`w-16 h-2 rounded-full ${getScoreColor(securityScore)}`}>
              <div 
                className="h-full bg-current rounded-full transition-all duration-300"
                style={{ width: `${securityScore}%` }}
              />
            </div>
            <span className="text-sm font-medium">{securityScore}%</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {settings.emailVerified ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Email Verified</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {settings.hasPassword ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Password Set</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {settings.twoFactorEnabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-red-500" />
              )}
              <span className="text-sm">Two-Factor Authentication</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">Active Sessions</span>
              <Badge variant="secondary">{settings.activeSessionCount}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Connected Accounts</span>
              <Badge variant="secondary">{settings.connectedAccounts.length}</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm">Account Age</span>
              <span className="text-sm text-gray-500">
                {format(new Date(settings.accountCreated), 'MMM yyyy')}
              </span>
            </div>
          </div>
        </div>

        {!settings.twoFactorEnabled && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Enable two-factor authentication to significantly improve your account security.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

function calculateSecurityScore(settings: SecuritySettingsType): number {
  let score = 0;
  
  if (settings.emailVerified) score += 20;
  if (settings.hasPassword) score += 20;
  if (settings.twoFactorEnabled) score += 40;
  if (settings.connectedAccounts.length > 0) score += 10;
  if (settings.activeSessionCount <= 3) score += 10;
  
  return Math.min(score, 100);
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-500';
  if (score >= 60) return 'text-yellow-500';
  return 'text-red-500';
}

interface SecurityPreferencesProps {
  settings: SecuritySettingsType;
  onUpdate: (settings: Partial<SecuritySettingsType>) => void;
  isUpdating: boolean;
}

function SecurityPreferences({ settings, onUpdate, isUpdating }: SecurityPreferencesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Settings className="h-5 w-5" />
          <span>Security Preferences</span>
        </CardTitle>
        <CardDescription>
          Configure your security settings and preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-alerts">Security Email Alerts</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive email notifications for security events
              </p>
            </div>
            <Switch
              id="email-alerts"
              checked={settings.emailSecurityAlerts}
              onCheckedChange={(checked) => onUpdate({ emailSecurityAlerts: checked })}
              disabled={isUpdating}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <Select
              value={settings.sessionTimeout.toString()}
              onValueChange={(value) => onUpdate({ sessionTimeout: parseInt(value) })}
              disabled={isUpdating}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select timeout duration" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day</SelectItem>
                <SelectItem value="7">7 days</SelectItem>
                <SelectItem value="30">30 days</SelectItem>
                <SelectItem value="90">90 days</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              How long you stay logged in when inactive
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ConnectedAccounts({ accounts }: { accounts: SecuritySettingsType['connectedAccounts'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <ExternalLink className="h-5 w-5" />
          <span>Connected Accounts</span>
        </CardTitle>
        <CardDescription>
          Social accounts linked to your profile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accounts.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No connected accounts
          </p>
        ) : (
          <div className="space-y-3">
            {accounts.map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium capitalize">
                      {account.provider.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium capitalize">{account.provider}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Connected {format(new Date(account.connectedAt), 'PPP')}
                    </p>
                  </div>
                </div>
                <Badge variant="secondary">Connected</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function SecuritySettings() {
  const { data: settings, isLoading, error } = useSecuritySettings();
  const updateSettingsMutation = useUpdateSecuritySettings();

  const handleUpdateSettings = (updates: Partial<SecuritySettingsType>) => {
    updateSettingsMutation.mutate(updates);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !settings) {
    return (
      <Card>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load security settings. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <SecurityOverview settings={settings} />
      <SecurityPreferences 
        settings={settings} 
        onUpdate={handleUpdateSettings}
        isUpdating={updateSettingsMutation.isPending}
      />
      <ConnectedAccounts accounts={settings.connectedAccounts} />
    </div>
  );
}
