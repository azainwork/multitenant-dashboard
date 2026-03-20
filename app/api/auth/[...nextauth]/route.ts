import NextAuth from 'next-auth'
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

const handler = NextAuth({
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: {label: 'Email', type: 'email'},
                password: {label: 'Password', type:'password'},
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                const user = await prisma.user.findUnique({
                    where: {email: credentials.email},
                })

                if(!user) return null
                
                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return{id: user.id, email: user.email, name: user.name, role: user.role}
            },
        }),
    ],

    callbacks: {
        async jwt({token, user}) {
            if(user) token.role = (user as any).role
            return token
        },
        async session({session, token}) {
            if(session.user) (session.user as any).role = token.role
            return session
        },
    },
    pages: {signIn: '/login'},
    session: {strategy: 'jwt'},
})

export { handler as GET, handler as POST}