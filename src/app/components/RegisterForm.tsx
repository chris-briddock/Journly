"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AlertCircle, Loader2 } from "lucide-react";
import { signIn, getProviders } from "next-auth/react";
import { useRegisterUser } from "@/hooks/use-users";
import { GoogleIcon } from "@/app/components/icons/Google";
import { GitHubIcon } from "@/app/components/icons/GitHub";
import { MicrosoftIcon } from "@/app/components/icons/Microsoft";

import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../components/ui/form";

type FormValues = {
  name: string;
  email: string;
  password: string;
};

interface Provider {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
}

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  // Use TanStack Query mutation
  const registerUserMutation = useRegisterUser();

  useEffect(() => {
    const loadProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    loadProviders();
  }, []);

  const form = useForm<FormValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: FormValues) => {
    setError("");

    // Use TanStack Query mutation
    registerUserMutation.mutate(values, {
      onSuccess: async () => {
        // Store email in sessionStorage for the success page
        sessionStorage.setItem("registered_email", values.email);

        // Redirect to registration success page
        router.push("/auth/register-success");
        router.refresh();
      },
      onError: (error: Error) => {
        setError(error.message || "Registration failed");
      },
    });
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your email" {...field} />
                </FormControl>
                <FormDescription>
                  We&apos;ll never share your email with anyone else.
                </FormDescription>
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
                    placeholder="Create a password"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Must be at least 8 characters long.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={registerUserMutation.isPending}>
            {registerUserMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
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
          const getProviderIcon = (providerId: string) => {
            switch (providerId) {
              case 'google':
                return <GoogleIcon className="w-5 h-5" />;
              case 'github':
                return <GitHubIcon className="w-5 h-5" />;
              case 'microsoft-entra-id':
                return <MicrosoftIcon className="w-5 h-5" />;
              default:
                return null;
            }
          };

          const getProviderName = (providerId: string, providerName: string) => {
            switch (providerId) {
              case 'microsoft-entra-id':
                return 'Microsoft';
              default:
                return providerName;
            }
          };

          return (
            <Button
              key={provider.id}
              variant="outline"
              className="w-full flex items-center justify-center gap-3 border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-800"
              onClick={() => signIn(provider.id, { callbackUrl: '/dashboard' })}
            >
              {getProviderIcon(provider.id)}
              <span>Register with {getProviderName(provider.id, provider.name)}</span>
            </Button>
          );
        })}
    </div>
  );
}
