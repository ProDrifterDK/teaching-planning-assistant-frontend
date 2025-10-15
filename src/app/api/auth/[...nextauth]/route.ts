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
        // 1. Get Token
        const tokenRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/token`, {
          method: 'POST',
          body: new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
          }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const tokenData = await tokenRes.json();

        if (!tokenRes.ok || !tokenData.access_token) {
          if (tokenData.detail) {
            throw new Error(tokenData.detail);
          }
          throw new Error("Failed to retrieve access token.");
        }

        // 2. Get User Profile
        const userRes = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/users/me`, {
          headers: {
            Authorization: `Bearer ${tokenData.access_token}`,
          },
        });

        const userData = await userRes.json();

        if (!userRes.ok || !userData) {
          throw new Error("Failed to fetch user profile after login.");
        }

        // 3. Return combined user object
        return {
          ...userData,
          access_token: tokenData.access_token,
        };
      },
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.access_token;
        token.name = user.full_name;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.accessToken) {
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }