import { NextRequest, NextResponse } from 'next/server';
import db from '@/infra/db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: paymentId } = await params;
  const body = await request.json();

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as any;
  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const refundId = `ref-${Math.random().toString(36).substr(2, 9)}`;
  
  db.prepare(`
    INSERT INTO refunds (
      id, orderId, paymentId, amount, createdAt, updatedAt, requesterId, requesterName, requesterEmail,
      acquirerId, acquirerDescription, acquirerStatus, acquirerStatusDetail, acquirerEc
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    refundId,
    payment.orderId,
    paymentId,
    body.amount,
    new Date().toISOString(),
    new Date().toISOString(),
    'admin-1',
    'Admin',
    'admin@multipay.com',
    payment.acquirerId,
    payment.acquirerDescription,
    'REFUNDED',
    'Refunded successfully',
    payment.acquirerEc
  );

  // Update order status if needed (mock logic)
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run('REFUNDED', payment.orderId);
  db.prepare('UPDATE payments SET status = ? WHERE id = ?').run('REFUNDED', paymentId);

  return NextResponse.json({ success: true, refundId });
}
