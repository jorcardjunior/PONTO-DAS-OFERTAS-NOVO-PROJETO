import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

const UpdateRoleSchema = z.object({
  role: z.enum(["admin", "user"], { errorMap: () => ({ message: "Role deve ser 'admin' ou 'user'" }) }),
});

/** PATCH /api/auth/users/[id] — Atualiza a role de um usuário (admin only) */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin();
    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;

    // Não permite que o admin se rebaixe
    if (id === authCheck.userId) {
      return NextResponse.json(
        { error: "Você não pode alterar sua própria role" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const parsed = UpdateRoleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Role inválida", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { role } = parsed.data;

    // Verifica se o usuário existe
    const userExists = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!userExists) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    const updated = await db.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Users PATCH error:", err);
    return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
  }
}

/** DELETE /api/auth/users/[id] — Remove um usuário (admin only) */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authCheck = await requireAdmin();
    if ("error" in authCheck) {
      return NextResponse.json({ error: authCheck.error }, { status: authCheck.status });
    }

    const { id } = await params;

    // Não permite que o admin se remova
    if (id === authCheck.userId) {
      return NextResponse.json(
        { error: "Você não pode remover sua própria conta" },
        { status: 400 }
      );
    }

    // Verifica se o usuário existe
    const userExists = await db.user.findUnique({ where: { id }, select: { id: true } });
    if (!userExists) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
    }

    // Remove dados relacionados e o usuário
    await db.$transaction([
      db.movement.deleteMany({ where: { userId: id } }),
      db.sale.deleteMany({ where: { userId: id } }),
      db.product.deleteMany({ where: { userId: id } }),
      db.category.deleteMany({ where: { userId: id } }),
      db.supplier.deleteMany({ where: { userId: id } }),
      db.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "Usuário removido com sucesso" });
  } catch (err) {
    console.error("Users DELETE error:", err);
    return NextResponse.json({ error: "Erro ao remover usuário" }, { status: 500 });
  }
}
