import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  const session = await auth();
  if (!session) return new NextResponse('Unauthorized', { status: 401 });
  const userId = (session.user as any).id;

  const stats = await db.sale.aggregate({
    where: { userId },
    _sum: { total: true },
    _count: { id: true }
  });

  return NextResponse.json({
    totalRevenue: stats._sum.total || 0,
    totalTransactions: stats._count.id || 0
  });
}
