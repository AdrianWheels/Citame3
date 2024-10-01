// types/next-auth.d.ts

import NextAuth from "next-auth";

// Extender los tipos de User y Session
declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
    };
  }

  interface User {
    accessToken?: string;
  }
}
