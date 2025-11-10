import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true, // Required for production/Docker
  debug: process.env.NODE_ENV === 'development', // Enable debug logs
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  pages: {
    signIn: "/auth/login",
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
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
