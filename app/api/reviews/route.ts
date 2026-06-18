import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { ObjectId } from 'mongodb';

async function updateApplicationStats(db: any, appName: string) {
  const appId = appName.toLowerCase() === 'cowatch' ? 'cowatch' : 'fetchflow';
  const reviews = await db.collection('reviews').find({ appName }).toArray();
  const reviewsCount = reviews.length;
  const averageRating = reviewsCount > 0
    ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount
    : 0;

  await db.collection('application').updateOne(
    { appId },
    { $set: { reviewsCount, averageRating } },
    { upsert: true }
  );
  console.log(`[KatyalStore] Application collection updated for ${appId}: count=${reviewsCount}, avgRating=${averageRating}`);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { appName, rating, title, content, author, email, timestamp } = body;

    // Validate input
    if (!appName || rating === undefined || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 0 and 5' },
        { status: 400 }
      );
    }

    if (title.length > 60 || content.length > 300) {
      return NextResponse.json(
        { error: 'Title or content exceeds maximum length' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Create flexible schema document for MongoDB
    const review = {
      appName,
      rating: numericRating,
      title,
      content,
      author: author || 'Store Guest',
      email: email.trim().toLowerCase(),
      timestamp: timestamp || new Date().toISOString(),
    };

    const result = await db.collection('reviews').insertOne(review);

    // Increment user's reviewsCount in user collection
    await db.collection('user').updateOne(
      { email: email.trim().toLowerCase() },
      { $inc: { reviewsCount: 1 } }
    );

    // Update application stats (reviewsCount and averageRating)
    await updateApplicationStats(db, appName);

    console.log('[KatyalStore] MongoDB Review submitted & reviewsCount incremented:', review);

    return NextResponse.json(
      { 
        success: true, 
        review: { 
          ...review, 
          id: result.insertedId.toString() 
        } 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('[KatyalStore] API POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const appName = request.nextUrl.searchParams.get('appName');
    const db = await getDb();

    let query = {};
    if (appName) {
      query = { appName };
    }

    // Fetch reviews from DB sorted by timestamp descending
    const appReviews = await db
      .collection('reviews')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray();

    // Map Mongo _id to string for dynamic component keys
    const formattedReviews = appReviews.map((r) => ({
      appName: r.appName,
      rating: r.rating,
      title: r.title,
      content: r.content,
      author: r.author,
      email: r.email,
      timestamp: r.timestamp,
      id: r._id.toString(),
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('[KatyalStore] API GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, rating, title, content, email } = body;

    if (!id || !email || rating === undefined || !title || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 0 || numericRating > 5) {
      return NextResponse.json(
        { error: 'Rating must be a number between 0 and 5' },
        { status: 400 }
      );
    }

    if (title.length > 60 || content.length > 300) {
      return NextResponse.json(
        { error: 'Title or content exceeds maximum length' },
        { status: 400 }
      );
    }

    const db = await getDb();
    
    // Find review to check ownership
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership via email check
    if (review.email !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'You do not have permission to edit this review' },
        { status: 403 }
      );
    }

    // Perform updates
    await db.collection('reviews').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          rating: numericRating,
          title,
          content,
          timestamp: new Date().toISOString(),
        }
      }
    );

    // Update application stats (reviewsCount and averageRating)
    await updateApplicationStats(db, review.appName);

    console.log('[KatyalStore] MongoDB Review updated:', id);

    return NextResponse.json({
      success: true,
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('[KatyalStore] API PUT Error:', error);
    return NextResponse.json(
      { error: 'Failed to update review' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const email = searchParams.get('email');

    if (!id || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid review ID format' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Find review to check ownership
    const review = await db.collection('reviews').findOne({ _id: new ObjectId(id) });
    if (!review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Verify ownership
    if (review.email !== email.trim().toLowerCase()) {
      return NextResponse.json(
        { error: 'You do not have permission to delete this review' },
        { status: 403 }
      );
    }

    // Delete review
    await db.collection('reviews').deleteOne({ _id: new ObjectId(id) });

    // Decrement user's reviewsCount in user collection
    await db.collection('user').updateOne(
      { email: email.trim().toLowerCase() },
      { $inc: { reviewsCount: -1 } }
    );

    // Update application stats (reviewsCount and averageRating)
    await updateApplicationStats(db, review.appName);

    console.log('[KatyalStore] MongoDB Review deleted & reviewsCount decremented:', id);

    return NextResponse.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('[KatyalStore] API DELETE Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete review' },
      { status: 500 }
    );
  }
}
