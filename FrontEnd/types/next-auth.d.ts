import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT, DefaultJWT } from 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      accountID?: string
      username?: string
      role?: string
      backendUser?: any
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    accountID?: string
    username?: string
    role?: string
    backendUser?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    accountID?: string
    username?: string
    role?: string
    backendUser?: any
    provider?: string
    picture?: string
  }
}
