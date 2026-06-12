import bcrypt from 'bcryptjs';
import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';

/** Verifica se o usuário logado é admin — usado pelas APIs de gerenciamento */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) {
    return { error: "Não autenticado", status: 401 } as const;
  }    const currentUser = await db.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

  if (!currentUser || currentUser.role !== "admin") {
    return { error: "Acesso restrito a administradores", status: 403 } as const;
  }

  return { userId: session.user.id } as const;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await db.user.findUnique({
          where: { email: String(credentials.email) }
        });

        if (!user || !user.passwordHash) return null;

        const isValid = await bcrypt.compare(
          String(credentials.password),
          user.passwordHash
        );

        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          tenantId: user.tenantId
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).id = user.id;
        (token as any).tenantId = (user as any).tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = (token as any).id;
        (session.user as any).tenantId = (token as any).tenantId;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
});
