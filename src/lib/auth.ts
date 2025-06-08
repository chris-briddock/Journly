import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";

import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyTwoFactorToken } from "@/lib/two-factor";

import { RecaptchaService } from "@/lib/services/recaptcha-service";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
    GitHub({
      authorization: {
        params: {
          scope: "read:user user:email",
        },
      },
    }),
    {
      id: "microsoft-entra-id",
      name: "Microsoft",
      type: "oauth",
      clientId: process.env.AUTH_MICROSOFT_ENTRA_ID_ID,
      clientSecret: process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET,
      authorization: {
        url: "https://login.microsoftonline.com/consumers/oauth2/v2.0/authorize",
        params: {
          scope: "https://graph.microsoft.com/user.read",
          response_type: "code",
          response_mode: "query",
        },
      },
      token: "https://login.microsoftonline.com/consumers/oauth2/v2.0/token",
      userinfo: "https://graph.microsoft.com/v1.0/me",
      checks: ["state"],
      profile(profile: { id: string; displayName: string; mail: string; userPrincipalName: string }) {
        return {
          id: profile.id,
          name: profile.displayName,
          email: profile.mail || profile.userPrincipalName,
          image: undefined,
        };
      },
    },
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorToken: { label: "2FA Token", type: "text" },
        recaptchaToken: { label: "reCAPTCHA Token", type: "text" }
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        // Verify reCAPTCHA if enabled (but skip for 2FA submissions)
        const credentialsWithTwoFactor = credentials as typeof credentials & {
          twoFactorToken?: string;
          recaptchaToken?: string;
        };

        // Only require reCAPTCHA for initial login, not for 2FA token submission
        if (RecaptchaService.isEnabled() && !credentialsWithTwoFactor.twoFactorToken) {
          if (!credentialsWithTwoFactor.recaptchaToken) {
            throw new Error("Please complete the reCAPTCHA verification");
          }

          // Get client IP from request
          const clientIP = req ? RecaptchaService.getClientIP(req as Request) : undefined;
          const captchaResult = await RecaptchaService.verifyToken(
            credentialsWithTwoFactor.recaptchaToken,
            clientIP
          );

          if (!captchaResult.success) {
            throw new Error(captchaResult.error || "reCAPTCHA verification failed");
          }
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email as string,
          },
        });

        if (!user) {
          throw new Error("No account found with this email address");
        }

        if (!user.password) {
          throw new Error("This account cannot use password login");
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Incorrect password. Please try again");
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error("EMAIL_NOT_VERIFIED");
        }

        // Check if 2FA is enabled for this user
        // Type assertion is safe here as we know the user object structure from Prisma
        const userWithTwoFactor = user as typeof user & {
          twoFactorEnabled?: boolean;
          twoFactorSecret?: string | null;
        };

        if (userWithTwoFactor.twoFactorEnabled) {
          // For 2FA users, we need to verify the TOTP token
          // The token should be provided in credentials.twoFactorToken
          const twoFactorToken = credentialsWithTwoFactor.twoFactorToken;

          if (!twoFactorToken) {
            // Return null to indicate authentication failed, but don't throw an error
            // The frontend will handle this by checking the error message
            return null;
          }

          // Verify the 2FA token using the user's secret
          if (!userWithTwoFactor.twoFactorSecret) {
            return null;
          }

          const isValidToken = verifyTwoFactorToken(twoFactorToken, userWithTwoFactor.twoFactorSecret);
          if (!isValidToken) {
            return null;
          }
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/login",
    error: "/login", // Redirect errors back to login page
  },
  callbacks: {
    async signIn({ account, profile, user }) {
      console.log('[Auth] SignIn callback - Account:', account?.provider);
      console.log('[Auth] SignIn callback - Profile email:', profile?.email);
      console.log('[Auth] SignIn callback - User:', user?.email);

      // For OAuth providers, handle account linking
      if (account?.provider && account.provider !== "credentials" && profile?.email) {
        try {
          // Check if a user with this email already exists
          const existingUser = await prisma.user.findUnique({
            where: { email: profile.email },
            include: { accounts: true }
          });

          if (existingUser) {
            // Check if this OAuth provider is already linked to the user
            const existingAccount = existingUser.accounts.find(
              (acc: { provider: string }) => acc.provider === account.provider
            );

            if (!existingAccount) {
              // Link the OAuth account to the existing user
              console.log(`[Auth] Linking ${account.provider} account to existing user:`, existingUser.id);
              await prisma.account.create({
                data: {
                  userId: existingUser.id,
                  type: account.type,
                  provider: account.provider,
                  providerAccountId: account.providerAccountId,
                  access_token: account.access_token as string | null,
                  expires_at: account.expires_at as number | null,
                  id_token: account.id_token as string | null,
                  refresh_token: account.refresh_token as string | null,
                  scope: account.scope as string | null,
                  session_state: account.session_state as string | null,
                  token_type: account.token_type as string | null,
                }
              });
              console.log(`[Auth] Successfully linked ${account.provider} account`);
            } else {
              console.log(`[Auth] ${account.provider} account already linked to user`);
            }
          }
        } catch (error) {
          console.error(`[Auth] Error linking ${account.provider} account:`, error);
          // Don't fail the sign-in if account linking fails
        }
      }

      // Allow all sign-ins to proceed
      return true;
    },

    async jwt({ token, user }) {
      console.log('[Auth] JWT callback - Input user:', user);
      console.log('[Auth] JWT callback - Input token:', token);

      // If user is available (during sign-in), add user data to token
      if (user) {
        token.id = user.id;

        // Fetch user role from database if not already in token
        if (!token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });

          if (dbUser) {
            token.role = dbUser.role;
          }
        }

        console.log('[Auth] JWT callback - Updated token:', token);
      }

      return token;
    },

    async session({ session, token }) {
      console.log('[Auth] Session callback - Input token:', token);
      console.log('[Auth] Session callback - Input session:', session);

      // With JWT strategy, we get the user data from the token
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        console.log('[Auth] Session callback - Updated session user:', session.user);
      } else {
        console.log('[Auth] Session callback - Missing token or session.user');
      }

      return session;
    },
  },
  // Add trusted hosts configuration
  trustHost: true,
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
});
