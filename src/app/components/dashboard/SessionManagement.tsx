"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
  Monitor, 
  Smartphone, 
  Tablet, 
  Globe, 
  Shield, 
  Trash2, 
  AlertTriangle,
  Loader2,
  CheckCircle
} from "lucide-react";
import { 
  useUserSessions, 
  useRevokeSession, 
  useRevokeAllOtherSessions,
  type SessionInfo 
} from "@/hooks/use-sessions";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

function getDeviceIcon(deviceInfo?: SessionInfo['deviceInfo']) {
  if (!deviceInfo) return <Monitor className="h-4 w-4" />;
  
  if (deviceInfo.isMobile) {
    return <Smartphone className="h-4 w-4" />;
  }
  
  if (deviceInfo.device?.toLowerCase().includes('tablet')) {
    return <Tablet className="h-4 w-4" />;
  }
  
  return <Monitor className="h-4 w-4" />;
}

function formatDeviceInfo(deviceInfo?: SessionInfo['deviceInfo']): string {
  if (!deviceInfo) return 'Unknown Device';
  
  const parts = [];
  if (deviceInfo.browser) parts.push(deviceInfo.browser);
  if (deviceInfo.os) parts.push(deviceInfo.os);
  if (deviceInfo.device && deviceInfo.device !== 'Desktop') parts.push(deviceInfo.device);
  
  return parts.length > 0 ? parts.join(' • ') : 'Unknown Device';
}

interface SessionItemProps {
  session: SessionInfo;
  onRevoke: (sessionId: string) => void;
  isRevoking: boolean;
}

function SessionItem({ session, onRevoke, isRevoking }: SessionItemProps) {
  const [showRevokeDialog, setShowRevokeDialog] = useState(false);

  const handleRevoke = () => {
    onRevoke(session.id);
    setShowRevokeDialog(false);
  };

  return (
    <>
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-1">
            {getDeviceIcon(session.deviceInfo)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {formatDeviceInfo(session.deviceInfo)}
              </p>
              {session.isCurrent && (
                <Badge variant="secondary" className="text-xs">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Current Session
                </Badge>
              )}
            </div>
            <div className="mt-1 space-y-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Expires: {format(new Date(session.expires), 'PPP')}
              </p>
              {session.ipAddress && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  <Globe className="h-3 w-3 inline mr-1" />
                  {session.ipAddress}
                  {session.location && ` • ${session.location.city}, ${session.location.country}`}
                </p>
              )}
              {session.lastAccessed && (
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Last active: {format(new Date(session.lastAccessed), 'PPp')}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {!session.isCurrent && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowRevokeDialog(true)}
            disabled={isRevoking}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
          >
            {isRevoking ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <Dialog open={showRevokeDialog} onOpenChange={setShowRevokeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke this session? The user will be signed out from this device.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {getDeviceIcon(session.deviceInfo)}
              <div>
                <p className="text-sm font-medium">{formatDeviceInfo(session.deviceInfo)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {session.ipAddress}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevoke}
              disabled={isRevoking}
            >
              {isRevoking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke Session'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function SessionManagement() {
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  
  const { data: sessionsData, isLoading, error } = useUserSessions();
  const revokeSessionMutation = useRevokeSession();
  const revokeAllOthersMutation = useRevokeAllOtherSessions();

  const handleRevokeSession = (sessionId: string) => {
    revokeSessionMutation.mutate(sessionId);
  };

  const handleRevokeAllOthers = () => {
    revokeAllOthersMutation.mutate();
    setShowRevokeAllDialog(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
          <CardDescription>
            Manage your active login sessions across devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Active Sessions</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load sessions. Please try again later.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const { sessions = [], sessionCount = 0 } = sessionsData || {};
  const otherSessions = sessions.filter(session => !session.isCurrent);

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Active Sessions</span>
              </CardTitle>
              <CardDescription>
                You have {sessionCount} active session{sessionCount !== 1 ? 's' : ''} across your devices
              </CardDescription>
            </div>
            {otherSessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRevokeAllDialog(true)}
                disabled={revokeAllOthersMutation.isPending}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950"
              >
                {revokeAllOthersMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Revoking...
                  </>
                ) : (
                  'Revoke All Others'
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {sessions.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-8">
              No active sessions found.
            </p>
          ) : (
            sessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                onRevoke={handleRevokeSession}
                isRevoking={revokeSessionMutation.isPending}
              />
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke All Other Sessions</DialogTitle>
            <DialogDescription>
              This will sign you out from all other devices and browsers. You will remain signed in on this device.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This action will revoke {otherSessions.length} session{otherSessions.length !== 1 ? 's' : ''}. 
                This cannot be undone.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRevokeAllDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleRevokeAllOthers}
              disabled={revokeAllOthersMutation.isPending}
            >
              {revokeAllOthersMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Revoking...
                </>
              ) : (
                'Revoke All Others'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
