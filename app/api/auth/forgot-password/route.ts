import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email é obrigatório" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Não revelar se o email existe ou não (segurança)
      return NextResponse.json({ message: "Se o email existir, você receberá um link de recuperação." });
    }

    // Gera token aleatório seguro
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

    await db.user.update({
      where: { email },
      data: { resetToken, resetTokenExpiry },
    });

    // Em produção, enviar email com o link
    const resetLink = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/pt/reset-password?token=${resetToken}`;

    // Por enquanto, logamos o link (futuramente enviar email)
    console.log("=== LINK DE RECUPERAÇÃO DE SENHA ===");
    console.log(resetLink);
    console.log("====================================");

    return NextResponse.json({
      message: "Se o email existir, você receberá um link de recuperação.",
      // Em desenvolvimento, retornamos o link para facilitar testes
      ...(process.env.NODE_ENV !== "production" && { resetLink }),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
