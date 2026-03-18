import { NextRequest, NextResponse } from 'next/server';
import db from '@/infra/db/sqlite';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  const body = await request.json();

  const order = db.prepare('SELECT * FROM orders WHERE id = ?').get(orderId) as any;
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  // Map "MULTIPAY-CANCELED" to "CANCELED"
  const newStatus = body.event === 'MULTIPAY-CANCELED' ? 'CANCELED' : order.status;

  db.prepare('UPDATE orders SET status = ?, updatedAt = ? WHERE id = ?').run(
    newStatus,
    new Date().toISOString(),
    orderId
  );

  return NextResponse.json({ success: true });
}
