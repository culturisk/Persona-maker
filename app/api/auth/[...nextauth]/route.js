import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { getOrCreateUser } from '../../../../lib/database.js';

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || 'demo-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'demo-client-secret',
      authorization: {
        params: {
          scope: 'openid email profile'
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        // Create or get user in our database
        const dbUser = await getOrCreateUser(user.email, user.name);
        user.id = dbUser.id;
        return true;
      } catch (error) {
        console.error('Sign in error:', error);
        return false;
      }
    },
    async session({ session, token }) {
      if (session.user) {
        // Get fresh user data from database
        try {
          const dbUser = await getOrCreateUser(session.user.email, session.user.name);
          session.user.id = dbUser.id;
        } catch (error) {
          console.error('Session error:', error);
        }
      }
      return session;
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error'
  },
  session: {
    strategy: 'jwt'
  }
});

export { handler as GET, handler as POST };