import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email } = body;

    // Validate request parameters
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Check if the user already exists in the 'user' collection
    let user = await db.collection('user').findOne({ email: email.trim() });

    if (!user) {
      // Create new user record
      const newUser = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        reviewsCount: 0,
        createdAt: new Date().toISOString(),
      };
      await db.collection('user').insertOne(newUser);
      user = newUser as any;
      console.log('[KatyalStore] MongoDB New User registered in user collection:', newUser);
    } else {
      console.log('[KatyalStore] MongoDB Existing User logged in from user collection:', user);
    }

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
      }
    });
  } catch (error) {
    console.error('[KatyalStore] Auth API Error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
