import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { apiService } from '@/services/api'

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
     async authorize(credentials) {
  const data = await apiService.login(
    credentials!.username,
    credentials!.password
  )

  if (!data.accessToken) return null

  return {
    id: data.username,
    name: data.username,
    username: data.username,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    role: data.role,
  }
},
    }),
  ],
  callbacks: {
  async jwt({ token, user }) {
  if (user) {
    token.accessToken = (user as any).accessToken
    token.refreshToken = (user as any).refreshToken
    token.role = (user as any).role
    token.username = (user as any).username
  }
  return token
},
    async session({ session, token }) {
  session.user = {
    ...session.user,
    name: token.username as string,
    accessToken: token.accessToken as string,
    refreshToken: token.refreshToken as string,
    role: token.role as string,
  }

  return session
},
  },
  pages: {
    signIn: '/auth',
  },
})

export { handler as GET, handler as POST }