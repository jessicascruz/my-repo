import { NextRequest, NextResponse } from 'next/server';
import db from '@/infra/db/sqlite';

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const payloadString = formData.get('manualPaymentRequestPayload') as string;
  const payload = JSON.parse(payloadString);

  const id = `mp-${Math.random().toString(36).substr(2, 9)}`;
  
  db.prepare(`
    INSERT INTO manual_payments (
      id, orderId, amount, reason, attachments, createdAt, updatedAt, requesterId, requesterName, requesterEmail
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    payload.orderId,
    payload.amount,
    payload.reason,
    JSON.stringify([]), // Mock attachments
    new Date().toISOString(),
    new Date().toISOString(),
    payload.requester.id,
    payload.requester.name,
    payload.requester.email
  );

  return NextResponse.json({ success: true, id });
}
