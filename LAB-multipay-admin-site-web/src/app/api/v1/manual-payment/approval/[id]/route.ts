import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  // Mock manual payment approval
  return NextResponse.json({ success: true });
}
