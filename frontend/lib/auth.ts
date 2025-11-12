import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

// Use a placeholder during build, NextAuth will validate at runtime
const AUTH_SECRET = process.env.AUTH_SECRET || 'build-time-placeholder-secret-min-32-chars-required';

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for production/Docker
  debug: process.env.NODE_ENV === "development", // Enable debug logs
  secret: AUTH_SECRET,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'placeholder-client-id',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'placeholder-client-secret',
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add user id to token when user first signs in
      if (user) {
        token.id = user.id || user.email;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user id to session from token
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnApp = nextUrl.pathname.startsWith("/app");

      if (isOnApp && !isLoggedIn) {
        return false; // Redirect to login page
      }

      return true;
    },
  },
  events: {
    async signOut() {
      // Clear any server-side session data
      console.log("User signed out");
    },
  },
});

const isJWTSessionError = (error: unknown): boolean => {
  if (!error) {
    return false;
  }

  if (error instanceof Error) {
    if (error.name === "JWTSessionError") {
      return true;
    }
    if (typeof error.message === "string" && error.message.includes("JWTSessionError")) {
      return true;
    }
  }

  if (typeof error === "object") {
    const err = error as Record<string, unknown>;
    const name = err.name ?? err.code ?? err.type;
    if (name === "JWTSessionError") {
      return true;
    }
    const message = err.message;
    if (typeof message === "string" && message.includes("JWTSessionError")) {
      return true;
    }
  }

  return false;
};

export async function safeAuth() {
  try {
    return await auth();
  } catch (error) {
    if (isJWTSessionError(error)) {
      console.warn("[auth] Invalid or expired session token – treating request as unauthenticated.");
      return null;
    }
    throw error;
  }
}
