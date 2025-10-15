import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }

  interface User {
    access_token?: string;
    full_name?: string | null;
    role?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    name?: string | null;
    email?: string | null;
    role?: string;
  }
}