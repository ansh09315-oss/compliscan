import { NextResponse } from 'next/server';
import { evaluateCompliance, type EvaluationInput } from '@/lib/complianceEngine';

export async function POST(request: Request) {
  try {
    const body: EvaluationInput = await request.json();
    const result = evaluateCompliance(body);
    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Evaluation failed' },
      { status: 400 }
    );
  }
}
