import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  console.error(
    "[NextAuth] Google credentials missing. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID (or GOOGLE_CLIENT_ID) and GOOGLE_CLIENT_SECRET.",
  );
}

if (!process.env.NEXTAUTH_SECRET) {
  console.error(
    "[NextAuth] NEXTAUTH_SECRET is not set. Google sign-in will fail in production.",
  );
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: googleClientId ?? "",
      clientSecret: googleClientSecret ?? "",
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account?.id_token) {
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }: any) {
      session.idToken = token.idToken;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
