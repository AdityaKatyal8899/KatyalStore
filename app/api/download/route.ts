import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { s3Client } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

// POST: Logs downloads (remains for compatibility/simulations)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, appName, timestamp } = body;

    // Validate request body
    if (!name || !email || !appName || !timestamp) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log to MongoDB downloads collection
    const db = await getDb();
    await db.collection('downloads').insertOne({
      name,
      email,
      appName,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1',
    });

    // Increment downloadsCount in application collection
    const appId = appName.toLowerCase() === 'cowatch' ? 'cowatch' : 'fetchflow';
    await db.collection('application').updateOne(
      { appId },
      { $inc: { downloadsCount: 1 } },
      { upsert: true }
    );

    console.log(`[KatyalStore] MongoDB POST Download logged: ${name} (${email}) - ${appName}`);

    return NextResponse.json(
      { success: true, message: 'Download logged successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Download logging error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET: Logs the download in DB AND redirects to AWS S3 presigned URL!
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const appId = searchParams.get('appId');
    const email = searchParams.get('email') || 'guest@example.com';
    const name = searchParams.get('name') || 'Store Guest';

    if (!appId) {
      return NextResponse.json(
        { error: 'Missing required appId parameter' },
        { status: 400 }
      );
    }

    const apksMap: Record<string, { fileName: string; appName: string }> = {
      'cowatch': {
        fileName: 'CoWatch-Latest-release.apk',
        appName: 'CoWatch',
      },
      'fetchflow': {
        fileName: 'FetchFlow-android-v.1.0.1.apk',
        appName: 'FetchFlow',
      },
    };

    const targetApp = apksMap[appId.toLowerCase()];
    if (!targetApp) {
      return NextResponse.json(
        { error: 'Invalid appId or APK not found in inventory' },
        { status: 404 }
      );
    }

    // Connect to database
    const db = await getDb();

    // Log the download event in downloads collection
    await db.collection('downloads').insertOne({
      name,
      email: email.trim().toLowerCase(),
      appName: targetApp.appName,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1',
    });

    // Increment downloadsCount in application collection
    await db.collection('application').updateOne(
      { appId: appId.toLowerCase() },
      { $inc: { downloadsCount: 1 } },
      { upsert: true }
    );

    console.log(`[KatyalStore] MongoDB GET Download logged: ${name} (${email}) - ${targetApp.appName}`);

    // 1. Try to generate presigned S3 URL and redirect if credentials exist
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME || 'katyalstore',
          Key: targetApp.fileName,
          ResponseContentDisposition: `attachment; filename="${targetApp.fileName}"`,
        });
        const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 });
        console.log(`[KatyalStore] Generated S3 presigned URL for download: ${presignedUrl}`);
        return NextResponse.redirect(presignedUrl);
      } catch (s3Error) {
        console.error('[KatyalStore] S3 presigned URL generation failed, checking local fallback:', s3Error);
      }
    }

    // 2. Local fallback streaming
    const filePath = path.join(process.cwd(), 'apks', targetApp.fileName);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      const fileStream = fs.createReadStream(filePath);
      return new Response(fileStream as any, {
        headers: {
          'Content-Type': 'application/vnd.android.package-archive',
          'Content-Disposition': `attachment; filename="${targetApp.fileName}"`,
          'Content-Length': stat.size.toString(),
        },
      });
    }

    return NextResponse.json(
      { error: `Installer file ${targetApp.fileName} is missing from both S3 and local storage` },
      { status: 404 }
    );
  } catch (error) {
    console.error('[KatyalStore] APK Streaming/Redirect Error:', error);
    return NextResponse.json(
      { error: 'Failed to process installer download' },
      { status: 500 }
    );
  }
}
