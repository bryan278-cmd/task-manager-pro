import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma.js";
import { compare } from "bcryptjs";

// Define auth options
export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Add null checks for credentials
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          // Check if user exists
          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Verify password
          const isValid = await compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error("Invalid credentials");
          }

          // Return user object without password
          return {
            id: user.id,
            email: user.email,
            name: user.name || null,
            experienceLevel: user.experienceLevel || null,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          throw new Error("Authentication failed");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.experienceLevel = user.experienceLevel;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
        session.user.email = token.email;
        session.user.name = token.name;
        session.user.experienceLevel = token.experienceLevel;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Export the default NextAuth handler
export default NextAuth(authOptions);
