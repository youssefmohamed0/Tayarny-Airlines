import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          // --- THE FIX IS HERE ---
          // When NextAuth runs this on the server (inside Docker), 
          // it must use the service name 'backend'.
          const isServer = typeof window === 'undefined';
          const BASE_URL = isServer 
            ? 'http://backend:9090' 
            : 'http://localhost:9090';

          console.log(`Attempting login at: ${BASE_URL}/api/auth/login`);

          const res = await fetch(`${BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'Accept': 'application/json' 
            },
            body: JSON.stringify({
              username: credentials?.username,
              password: credentials?.password,
            }),
          });

          // If the fetch itself fails or backend returns 4xx/5xx
          if (!res.ok) {
            const errorData = await res.text();
            console.error("Backend Error Response:", errorData);
            return null;
          }

          const user = await res.json();

          // Check if the user object contains your expected token
          if (user && user.accessToken) {
            return {
              id: user.username,
              name: user.username,
              username: user.username,
              accessToken: user.accessToken,
              refreshToken: user.refreshToken,
              role: user.role,
            };
          }

          return null;
        } catch (error) {
          // This catches the "fetch failed" error
          console.error("DOCKER_NETWORK_ERROR:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = (user as any).accessToken;
        token.refreshToken = (user as any).refreshToken;
        token.role = (user as any).role;
        token.username = (user as any).username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as any).accessToken = token.accessToken;
        (session.user as any).refreshToken = token.refreshToken;
        (session.user as any).role = token.role;
        (session.user as any).username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth',
  },
  session: {
    strategy: 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET || 'secret', // Ensure you have a secret
})

export { handler as GET, handler as POST }