"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { Button } from "@/app/components/ui/button";

type Provider = {
  id: string;
  name: string;
  type: string;
  signinUrl: string;
  callbackUrl: string;
};

export default function AuthProviders() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    const fetchProviders = async () => {
      const providers = await getProviders();
      setProviders(providers);
    };
    fetchProviders();
  }, []);

  if (!providers) {
    return null;
  }

  return (
    <>
      {Object.values(providers)
        .filter((provider) => provider.id !== "credentials")
        .map((provider) => (
          <Button
            key={provider.id}
            variant="outline"
            className="w-full"
            onClick={() => signIn(provider.id, { callbackUrl: "/dashboard" })}
          >
            Sign in with {provider.name}
          </Button>
        ))}
    </>
  );
}
