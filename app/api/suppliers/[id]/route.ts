import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SupplierSchema } from "@/lib/schemas";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  const body = await req.json();
  const parsed = SupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, contact, email, phone, cnpj } = parsed.data;

  // Verifica ownership antes de atualizar
  const existing = await db.supplier.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
  }

  const supplier = await db.supplier.update({
    where: { id },
    data: {
      name,
      contact: contact || null,
      email: email || null,
      phone: phone || null,
      cnpj: cnpj || null,
    },
  });
  return NextResponse.json(supplier);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  // Verifica ownership antes de deletar
  const existing = await db.supplier.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Fornecedor não encontrado" }, { status: 404 });
  }

  await db.supplier.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
