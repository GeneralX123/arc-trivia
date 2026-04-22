import { NextAuthOptions } from "next-auth";
import TwitterProvider from "next-auth/providers/twitter";

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID!,
      clientSecret: process.env.TWITTER_CLIENT_SECRET!,
      version: "2.0",
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.xUsername = (profile as any).data?.username ?? (profile as any).username;
        token.xName = (profile as any).data?.name ?? (profile as any).name;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.xUsername = token.xUsername as string;
      session.user.xName = token.xName as string;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      xUsername?: string;
      xName?: string;
    };
  }
}
