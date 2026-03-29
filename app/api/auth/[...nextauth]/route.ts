import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Admin Login",
            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                // Simple hardcoded check for now.
                // In production, move these to env vars: ADMIN_USER, ADMIN_PASS
                const user = process.env.ADMIN_USER || "admin";
                const pass = process.env.ADMIN_PASS || "admin123";

                if (credentials?.username === user && credentials?.password === pass) {
                    return { id: "1", name: "Administrator", email: "admin@lottoglobal.com" };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: "/login",
    },
    callbacks: {
        async session({ session, token }) {
            return session;
        },
        async jwt({ token, user }) {
            return token;
        }
    },
    secret: process.env.NEXTAUTH_SECRET || "changeme_super_secret",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
