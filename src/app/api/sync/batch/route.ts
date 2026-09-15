import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = body; // Array of offline dossiers

    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { success: false, error: 'Missing items array' },
        { status: 400 }
      );
    }

    // Simulate batch sync processing
    const results = items.map((item: any) => ({
      id: item.id,
      dossierReferenceCode: item.dossierReferenceCode,
      status: 'synced',
      syncedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      syncedCount: results.length,
      results,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
