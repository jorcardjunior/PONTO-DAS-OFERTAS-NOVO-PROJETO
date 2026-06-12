import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  // Busca todos os produtos e filtra no servidor
  // (Prisma não suporta referência a colunas em where clauses como stock <= minStock)
  const allProducts = await db.product.findMany({
    where: { userId },
    select: { id: true, name: true, sku: true, stock: true, minStock: true, image: true },
    orderBy: { stock: "asc" },
  });

  const lowStock = allProducts.filter((p) => p.stock <= p.minStock);
  const critical = lowStock.filter((p) => p.stock <= 0);
  const warning = lowStock.filter((p) => p.stock > 0);

  return NextResponse.json({
    critical: critical.length,
    warning: warning.length,
    total: lowStock.length,
    products: lowStock.slice(0, 20),
  });
}
