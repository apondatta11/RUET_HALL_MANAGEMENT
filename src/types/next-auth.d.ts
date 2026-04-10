import { DefaultSession } from "next-auth";

/*
By default, NextAuth session looks like:
session.user = {
  name?: string
  email?: string
  image?: string
}
but i added from my auth : {id,role,phone} so for adding those we extend the next-auth types
& DefaultSession["user"] retains the default types
Final Shape: 
session.user = {
  id: string
  role: string
  phone: string
  name?: string
  email?: string
  image?: string
}
*/
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