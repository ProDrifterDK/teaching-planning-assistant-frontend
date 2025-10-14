import NextAuth, { AuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: "Username", type: "text" },
        password: {  label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
          method: 'POST',
          body: new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
          }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const data = await res.json();

        if (res.ok && data) {
          return { ...data, username: credentials.username };
        }
        return null;
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }