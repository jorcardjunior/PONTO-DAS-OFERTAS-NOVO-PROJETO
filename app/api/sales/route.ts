import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SaleSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = SaleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { productId, quantity, price, total, channel, date } = parsed.data;

  // Interactive transaction para evitar race conditions (serializable isolation no PostgreSQL)
  try {
    const sale = await db.$transaction(async (tx) => {
      const product = await tx.product.findUnique({ where: { id: productId } });
      if (!product) throw new Error("Product not found");
      if (product.stock < quantity) throw new Error("Insufficient stock");

      const newStock = product.stock - quantity;
      const saleCost = product.cost * quantity;

      const newSale = await tx.sale.create({
        data: {
          productId, quantity, price,
          total: total ?? quantity * price,
          cost: saleCost, channel: channel || "Loja Fisica",
          date: date ? new Date(date) : new Date(),
          userId, tenantId: product.tenantId,
        },
      });
      await tx.product.update({ where: { id: productId }, data: { stock: newStock } });
      await tx.movement.create({
        data: {
          productId, type: "OUT", quantity,
          reason: `Venda via ${channel || "Loja Fisica"}`,
          userId, tenantId: product.tenantId,
        },
      });

      return newSale;
    });

    return NextResponse.json(sale);
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

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const sales = await db.sale.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    take: 100,
    include: { product: { select: { id: true, name: true, sku: true, image: true, cost: true } } },
  });

  const stats = await db.sale.aggregate({
    where: { userId },
    _sum: { total: true, cost: true },
    _count: { id: true },
  });

  return NextResponse.json({ sales, stats });
}
