import NextAuth from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import axios from 'axios'

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
      if (account && profile && account.provider === 'google') {
        // Sync Google user with backend
        try {
          console.log('[NextAuth] Syncing Google user with backend...')
          const response = await axios.post('http://localhost:5000/api/auth/google-sync', {
            sub: account.providerAccountId,
            email: profile.email,
            name: profile.name,
            picture: (profile as any).picture,
            role: 'Customer'
          })

          if (response.data.success) {
            const backendUser = response.data.user
            const jwtToken = response.data.token // 🔑 Get JWT token from backend

            token.backendUser = backendUser
            token.accountID = backendUser.accountID
            token.username = backendUser.username
            token.role = backendUser.role
            token.jwtToken = jwtToken // 🔑 Store JWT token in NextAuth token

            console.log('[NextAuth] Backend sync successful:', backendUser)
            console.log('[NextAuth] JWT token received:', jwtToken ? jwtToken.substring(0, 20) + '...' : 'none')

            // Note: localStorage will be handled on client-side in useAuth hook
          }
        } catch (error) {
          console.error('[NextAuth] Backend sync failed:', error)
        }

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
          email: token.email as string,
          // Add backend user info
          accountID: (token as any).accountID,
          username: (token as any).username,
          role: (token as any).role,
          backendUser: (token as any).backendUser,
          jwtToken: (token as any).jwtToken // 🔑 Include JWT token in session
        }
      }
      return session
    },
    async signIn({ account, profile }) {
      if (account?.provider === 'google') {
        return true
      }
      return true
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
})

export { handler as GET, handler as POST }
