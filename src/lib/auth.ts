import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyTwoFactorToken } from "@/lib/two-factor";

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        twoFactorToken: { label: "2FA Token", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
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
          const credentialsWithTwoFactor = credentials as typeof credentials & {
            twoFactorToken?: string;
          };
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
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn() {
      // Allow all sign-ins to proceed - error handling is done in the authorize function
      return true;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub || '';

        // Add role from token to session user
        if (token.role) {
          session.user.role = token.role as string;
        }
      }
      console.log('Auth callback - Session user:', session.user);
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;

        // If this is the first sign in, fetch the user's role
        if (!token.role) {
          const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            select: { role: true }
          });

          if (dbUser) {
            token.role = dbUser.role;
          }
        }
      }
      console.log('Auth callback - JWT token:', token);
      return token;
    },
  },
  // Add trusted hosts configuration
  trustHost: true,
  // Debug mode for development
  debug: process.env.NODE_ENV === 'development',
});
