import { NextRequest, NextResponse } from 'next/server';
import db from '@/infra/db/sqlite';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  
  const manualPayments = db.prepare('SELECT * FROM manual_payments WHERE orderId = ?').all(orderId) as any[];

  return NextResponse.json(manualPayments.map(mp => ({
    id: mp.id,
    amount: mp.amount,
    reason: mp.reason,
    attachments: JSON.parse(mp.attachments),
    createdAt: mp.createdAt,
    updatedAt: mp.updatedAt,
    requester: {
      id: mp.requesterId,
      name: mp.requesterName,
      email: mp.requesterEmail,
    },
    receipts: [], // Missing in previous mapping
    approvals: [], // Missing in previous mapping
    acquirer: { // Mocked acquirer for manual payment
        id: 1,
        ec: 'MANUAL',
        description: 'Manual Payment',
        status: 'approved',
        statusDetail: 'Approved manually',
        nsu: 'N/A',
        transactionId: 'N/A',
        internalPaymentId: 'N/A',
        authorizationCode: 'N/A'
    }
  })));
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) {
    await params;
    // Approval route: /v1/manual-payment/approval/${manualPaymentId}
    // Note: The repository uses this URL structure
    return NextResponse.json({ success: true });
  }
