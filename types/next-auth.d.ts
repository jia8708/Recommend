import NextAuth from "next-auth";

declare module "next-auth" {
    interface Session {
        accessToken?: string;
        user: {
            id?: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
            profile?: string;
            avatarKey?: string;
            token?: string;
            role?:string;
        }
    }

    interface User {
        id: string;
        name: string;
        email: string;
        image?: string | null;
        token: string;
        profile?: string;
        avatarKey?: string;
        role:string;
    }
} 