import { NextResponse } from 'next/server';

const MOCK_INSPECTOR = {
  id: 'insp-001',
  badgeNumber: '1045',
  fullName: 'Rajesh Kumar Sharma',
  email: 'rk.sharma@legalmetrology.gov.in',
  assignedDistrict: 'Central Delhi',
  stateTerritory: 'Delhi NCT',
  publicKey: 'RSA-2048-GOV-SIMULATED-KEY',
  isActive: true,
};

export async function POST(request: Request) {
  const body = await request.json();
  const { officerId, password } = body;

  // Simulated auth — accept any officer ID
  if (officerId) {
    return NextResponse.json({
      success: true,
      inspector: { ...MOCK_INSPECTOR, badgeNumber: officerId },
      token: `mock-jwt-${Date.now()}`,
    });
  }

  return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
}
