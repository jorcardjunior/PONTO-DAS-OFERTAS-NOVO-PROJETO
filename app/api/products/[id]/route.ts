import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ProductSchema } from "@/lib/schemas";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { sku, name, description, stock, minStock, price, cost, image, marketplace, details, categoryId, supplierId } = parsed.data;

  // Verifica ownership antes de atualizar
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  const product = await db.product.update({
    where: { id },
    data: {
      sku,
      name,
      description: description || "",
      stock,
      minStock,
      price,
      cost,
      image: image || null,
      marketplace: marketplace || null,
      details: details || undefined,
      categoryId: categoryId || null,
      supplierId: supplierId || null,
    },
    include: { category: true, supplier: true },
  });
  return NextResponse.json(product);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const { id } = await params;

  // Verifica ownership antes de deletar
  const existing = await db.product.findUnique({ where: { id } });
  if (!existing || existing.userId !== userId) {
    return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
  }

  await db.product.delete({ where: { id } });
  return new NextResponse(null, { status: 204 });
}
