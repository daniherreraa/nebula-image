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
