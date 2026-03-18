import { NextRequest, NextResponse } from 'next/server';
import { cancelPayment } from '@/infra/db/mutations';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  cancelPayment(id);
  return NextResponse.json({ success: true });
}
