import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { MovementSchema } from "@/lib/schemas";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const movements = await db.movement.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 100,
    include: { product: { select: { id: true, name: true, sku: true, image: true } } },
  });

  return NextResponse.json(movements);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = MovementSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { productId, type, quantity, reason } = parsed.data;

  // Interactive transaction para evitar race conditions
  try {
    const movement = await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");

      const newStock = type === "IN" ? product.stock + quantity : product.stock - quantity;
      if (type === "OUT" && newStock < 0) throw new Error("Insufficient stock");

      const newMovement = await tx.movement.create({
        data: {
          productId, type, quantity,
          reason: reason || "Ajuste manual",
          userId,
          tenantId: product.tenantId || "default",
        },
      });
      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });

      return newMovement;
    });

    return NextResponse.json(movement);
  } catch (err: any) {
    if (err.message === "Product not found") {
      return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 });
    }
    if (err.message === "Insufficient stock") {
      return NextResponse.json({ error: "Estoque insuficiente" }, { status: 400 });
    }
    throw err;
  }
}
