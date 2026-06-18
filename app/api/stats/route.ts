import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Count dynamic documents
    const totalDownloads = await db.collection('downloads').countDocuments();
    const totalReviews = await db.collection('reviews').countDocuments();

    return NextResponse.json({
      totalDownloads,
      totalReviews,
    });
  } catch (error) {
    console.error('[KatyalStore] API stats GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve site statistics' },
      { status: 500 }
    );
  }
}
