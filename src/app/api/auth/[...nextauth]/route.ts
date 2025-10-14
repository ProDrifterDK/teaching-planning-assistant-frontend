import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"

const handler = NextAuth({
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
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/token`, {
          method: 'POST',
          body: new URLSearchParams({
            username: credentials.username,
            password: credentials.password,
          }),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        });

        const user = await res.json();

        if (res.ok && user) {
          return { ...user, username: credentials.username };
        }
        return null;
      },
    })
  ],
  pages: {
    signIn: '/auth/signin',
  },
});

export { handler as GET, handler as POST }