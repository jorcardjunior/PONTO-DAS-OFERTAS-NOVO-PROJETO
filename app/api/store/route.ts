import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

/** GET /api/store — Retorna os dados da loja do usuário logado */
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Tenta encontrar a store, se não existir, retorna null
    const store = await db.store.findUnique({
      where: { userId },
    });

    return NextResponse.json(store || {});
  } catch (err) {
    console.error("Store GET error:", err);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}

/** PATCH /api/store — Atualiza ou cria os dados da loja */
export async function PATCH(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await req.json();

    const {
      name, cnpj, ie, phone, whatsapp, email,
      cep, address, district, city, state,
    } = body;

    // Upsert: cria se não existir, atualiza se existir
    const store = await db.store.upsert({
      where: { userId },
      create: {
        name: name || "",
        cnpj: cnpj || null,
        ie: ie || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        cep: cep || null,
        address: address || null,
        district: district || null,
        city: city || null,
        state: state || null,
        userId,
        tenantId: "default",
      },
      update: {
        name: name || "",
        cnpj: cnpj || null,
        ie: ie || null,
        phone: phone || null,
        whatsapp: whatsapp || null,
        email: email || null,
        cep: cep || null,
        address: address || null,
        district: district || null,
        city: city || null,
        state: state || null,
      },
    });

    return NextResponse.json(store);
  } catch (err) {
    console.error("Store PATCH error:", err);
    return NextResponse.json({ error: "Erro ao salvar dados da loja" }, { status: 500 });
  }
}
