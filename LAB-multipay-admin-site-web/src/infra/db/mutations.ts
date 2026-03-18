import db from '@/infra/db/sqlite';

export function cancelOrder(orderId: string) {
  return db.prepare("UPDATE orders SET status = 'CANCELLED' WHERE id = ?").run(orderId);
}

export function cancelPayment(paymentId: string) {
  return db.prepare("UPDATE payments SET status = 'CANCELLED' WHERE id = ?").run(paymentId);
}

export function refundPayment(paymentId: string, amount: number, requester: any) {
  const payment = db.prepare('SELECT orderId FROM payments WHERE id = ?').get(paymentId) as { orderId: string };
  if (!payment) return null;

  const id = Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO refunds (
      id, orderId, paymentId, amount, createdAt, updatedAt, requesterId, requesterName, requesterEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, payment.orderId, paymentId, amount, now, now, requester.id, requester.name, requester.email);

  db.prepare("UPDATE payments SET status = 'REFUNDED' WHERE id = ?").run(paymentId);
  return id;
}

export function createManualPayment(data: any) {
  const id = Math.random().toString(36).substr(2, 9);
  const now = new Date().toISOString();

  return db.prepare(`
    INSERT INTO manual_payments (
      id, orderId, amount, reason, attachments, createdAt, updatedAt, status, requesterId, requesterName, requesterEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    data.orderId,
    data.amount,
    data.reason,
    JSON.stringify(data.files || []),
    now,
    now,
    'pending',
    data.requester.id,
    data.requester.name,
    data.requester.email
  );
}

export function approveManualPayment(manualPaymentId: string, isApproved: boolean) {
  const status = isApproved ? 'APPROVED' : 'REJECTED';
  return db.prepare("UPDATE manual_payments SET status = ? WHERE id = ?").run(status, manualPaymentId);
}
