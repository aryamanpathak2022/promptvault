import NextAuth from 'next-auth'
import GithubProvider from 'next-auth/providers/github'

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  session: { strategy: 'jwt' },
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID!,
      clientSecret: process.env.GITHUB_SECRET!,
      checks: ['state'],
    }),
  ],
  cookies: {
    state: {
      name: 'authjs.state',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
    csrfToken: {
      name: 'authjs.csrf-token',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
    callbackUrl: {
      name: 'authjs.callback-url',
      options: { sameSite: 'none', path: '/', secure: true },
    },
    pkceCodeVerifier: {
      name: 'authjs.pkce-code-verifier',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
    sessionToken: {
      name: 'authjs.session-token',
      options: { httpOnly: true, sameSite: 'none', path: '/', secure: true },
    },
  },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user, profile }) {
      if (user) { token.id = user.id }
      if (profile) { token.login = (profile as any).login }
      return token
    },
    session({ session, token }) {
      if (session.user) { session.user.id = token.sub! }
      return session
    },
  },
})
