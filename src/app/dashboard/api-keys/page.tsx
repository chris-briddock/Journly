'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Trash2, Copy, Plus, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ApiKey {
  id: string;
  name: string;
  keyPrefix: string;
  permissions: string[];
  lastUsedAt: Date | null;
  createdAt: Date;
  expiresAt: Date | null;
  isActive: boolean;
}

interface CreateApiKeyResponse {
  id: string;
  name: string;
  key: string;
  keyPrefix: string;
  permissions: string[];
  expiresAt: Date | null;
  createdAt: Date;
}

export default function ApiKeysPage() {
  const { data: session, status } = useSession();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newlyCreatedKey, setNewlyCreatedKey] = useState<CreateApiKeyResponse | null>(null);
  const [showFullKey, setShowFullKey] = useState(false);
  const API_URL: string = `${process.env.NEXT_PUBLIC_APP_URL}/api/posts` || 'http://localhost:3000/api/posts';

  // Fetch API keys
  const fetchApiKeys = async () => {
    try {
      const response = await fetch('/api/user/api-keys');
      if (response.ok) {
        const data = await response.json();
        setApiKeys(data.apiKeys);
      } else {
        toast.error('Failed to fetch API keys');
      }
    } catch (error) {
      console.error('Error fetching API keys:', error);
      toast.error('Failed to fetch API keys');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'loading') return;

    if (status === 'unauthenticated') {
      redirect('/login');
    } else if (session) {
      fetchApiKeys();
    }
  }, [session, status]);

  // Create new API key
  const createApiKey = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for your API key');
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/user/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newKeyName.trim(),
        }),
      });

      if (response.ok) {
        const newKey = await response.json();
        setNewlyCreatedKey(newKey);
        setNewKeyName('');
        setShowCreateForm(false);
        await fetchApiKeys();
        toast.success('API key created successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create API key');
      }
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  // Delete API key
  const deleteApiKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to delete this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/user/api-keys/${keyId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchApiKeys();
        toast.success('API key deleted successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete API key');
      }
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  // Format date
  const formatDate = (date: Date | string | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">API Keys</h1>
          <p className="text-muted-foreground">
            Manage your API keys for programmatic access to create posts.
          </p>
        </div>

        {/* Newly created key display */}
        {newlyCreatedKey && (
          <Card className="mb-6 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                <AlertTriangle className="h-5 w-5" />
                API Key Created Successfully
              </CardTitle>
              <CardDescription className="text-green-700 dark:text-green-300">
                Save this key now - you won&apos;t be able to see it again!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-green-800 dark:text-green-200">
                    API Key
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      type={showFullKey ? 'text' : 'password'}
                      value={newlyCreatedKey.key}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullKey(!showFullKey)}
                    >
                      {showFullKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(newlyCreatedKey.key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setNewlyCreatedKey(null)}
                  className="w-full"
                >
                  I&apos;ve saved my API key
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Create new API key */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create New API Key</CardTitle>
            <CardDescription>
              API keys allow you to create posts programmatically. You can have up to 5 active keys.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!showCreateForm ? (
              <Button
                onClick={() => setShowCreateForm(true)}
                disabled={apiKeys.length >= 5}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                {apiKeys.length >= 5 ? 'Maximum API keys reached' : 'Create New API Key'}
              </Button>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">API Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Blog automation, Content management"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    maxLength={50}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={createApiKey}
                    disabled={creating || !newKeyName.trim()}
                  >
                    {creating ? 'Creating...' : 'Create API Key'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewKeyName('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* API Keys list */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your API Keys ({apiKeys.length}/5)</h2>
          
          {apiKeys.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">No API keys created yet.</p>
              </CardContent>
            </Card>
          ) : (
            apiKeys.map((apiKey) => (
              <Card key={apiKey.id}>
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium">{apiKey.name}</h3>
                        <Badge variant="secondary">posts:create</Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Key: {apiKey.keyPrefix}</p>
                        <p>Created: {formatDate(apiKey.createdAt)}</p>
                        <p>Last used: {formatDate(apiKey.lastUsedAt)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(apiKey.keyPrefix)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteApiKey(apiKey.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Usage instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How to Use Your API Key</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Using with cURL:</h4>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`curl -X POST ${API_URL} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -d '{
  {
  "title": "Your Post Title",
  "content": "Your content",
  "excerpt": "Your excerpt",
  "status": "draft",
  "featuredImage": "",
  "categoryIds": [],
  "seoTitle": "Your title that appears on a search engine",
  "seoDescription": "Your description that appears on a search engine",
  "seoKeywords": "Your keywords for SEO",
  "seoCanonicalUrl": "",
  "ogImage": "",
  "noIndex": false
  }'`}
              </pre>
            </div>
            <div>
              <h4 className="font-medium mb-2">Using with Postman:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Set method to POST and URL to <code>{API_URL}</code></li>
                <li>Add header: <code>Authorization: Bearer YOUR_API_KEY</code></li>
                <li>Set body to raw JSON with your post data</li>
                <li>Send the request</li>
              </ol>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-950 p-3 rounded">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Note:</strong> API keys can only be used to create posts. All other operations require session authentication.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
