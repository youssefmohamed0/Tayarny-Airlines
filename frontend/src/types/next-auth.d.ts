import NextAuth from 'next-auth'

declare module 'next-auth' {
  interface User {
    accessToken: string
    refreshToken: string
    role: string
  }
  interface Session {
    user: {
      name?: string
      accessToken: string
      refreshToken: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken: string
    refreshToken: string
    role: string
  }
}