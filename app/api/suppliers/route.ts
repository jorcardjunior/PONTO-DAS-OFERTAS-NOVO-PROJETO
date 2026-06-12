import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { SupplierSchema } from "@/lib/schemas";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const suppliers = await db.supplier.findMany({
    where: { userId },
    orderBy: { name: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return NextResponse.json(suppliers);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;

  const body = await req.json();
  const parsed = SupplierSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const { name, contact, email, phone, cnpj } = parsed.data;

  const supplier = await db.supplier.create({
    data: {
      name,
      contact: contact || null,
      email: email || null,
      phone: phone || null,
      cnpj: cnpj || null,
      userId,
      tenantId: (session.user as any).tenantId || "default",
    },
  });

  return NextResponse.json(supplier);
}
