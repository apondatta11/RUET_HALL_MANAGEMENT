//src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id:    string;
      role:  string;  // "STUDENT" | "MANAGER" | "ADMIN"
      isResident: boolean;
      onboardingCompleted: boolean;
      hallId?: string | null;
      roomNumber?: string | null;
    } & DefaultSession["user"];
  }
  // Extend the User type that authorize() returns
  interface User {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?:  string;
    isResident?: boolean;
    onboardingCompleted?: boolean;
    hallId?: string | null;
    roomNumber?: string | null;
  }
}
// same thing here
declare module "next-auth/jwt" {
  interface JWT {
    id:    string;
    role:  string;
    isResident: boolean;
    onboardingCompleted: boolean;
    hallId?: string | null;
    roomNumber?: string | null;
  }
}