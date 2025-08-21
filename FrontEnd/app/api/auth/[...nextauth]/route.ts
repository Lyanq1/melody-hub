import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || ''
    })
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.provider = account.provider
        token.picture = (profile as any).picture
        token.name = profile.name
        token.email = profile.email
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          image: (token as any).picture,
          name: token.name as string,
          email: token.email as string
        }
      }
      return session
    }
  }
})

export { handler as GET, handler as POST }
