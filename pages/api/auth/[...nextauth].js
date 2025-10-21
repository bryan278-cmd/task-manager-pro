import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "../../../lib/prisma";
import { compare } from "bcryptjs";

// Check for required environment variables
const hasRequiredEnvVars = process.env.NEXTAUTH_SECRET;

// Log error in production if env vars are missing
if (!hasRequiredEnvVars && process.env.NODE_ENV === 'production') {
  console.error('[NextAuth] Missing NEXTAUTH_SECRET in production.');
}

// Define auth options
const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("Invalid credentials");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name || null,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user && token?.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Export NextAuth handler or error handler based on environment variables
export default function handler(req, res) {
  if (!hasRequiredEnvVars) {
    // Return controlled error when env vars are missing
    return res.status(500).json({ 
      error: 'Server misconfiguration', 
      message: 'Authentication not configured properly' 
    });
  }
  
  // Use NextAuth when env vars are present
  return NextAuth(req, res, authOptions);
}
