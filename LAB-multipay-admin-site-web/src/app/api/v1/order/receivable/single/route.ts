import { NextRequest, NextResponse } from 'next/server';
import { getAllOrders, getOrderById } from '@/infra/db/queries';
import { seed } from '@/infra/db/seed';

export async function GET(request: NextRequest) {
  // Ensure DB is seeded
  seed();

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get('orderId');

  if (orderId) {
    const order = getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ data: [], paging: { currentPage: 1, pages: 0, perPage: 10, total: 0 } });
    }
    return NextResponse.json({
      data: [order],
      paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
    });
  }

  const page = parseInt(searchParams.get('page') || '1');
  const perPage = 10;
  const offset = (page - 1) * perPage;

  const { data, total } = getAllOrders(perPage, offset);

  return NextResponse.json({
    data,
    paging: {
      currentPage: page,
      pages: Math.ceil(total / perPage),
      perPage,
      total,
    },
  });
}
