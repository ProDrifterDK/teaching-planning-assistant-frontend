import 'next-auth';

declare module 'next-auth' {
  interface Session {
    accessToken?: string;
  }

  interface User {
    access_token?: string;
    full_name?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    accessToken?: string;
    name?: string | null;
    email?: string | null;
  }
}