import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { ProductSchema } from "@/lib/schemas";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const products = await db.product.findMany({
    where: { userId: (session.user as any).id },
    orderBy: { updatedAt: "desc" },
    include: { category: true, supplier: true },
  });

  return NextResponse.json(products);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = ProductSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { sku, name, description, stock, minStock, price, cost, image, marketplace, details, categoryId, supplierId } = parsed.data;

  const product = await db.product.create({
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
      userId: (session.user as any).id,
      tenantId: (session.user as any).tenantId || "default",
    },
    include: { category: true, supplier: true },
  });

  return NextResponse.json(product);
}
