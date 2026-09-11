import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { sendDownloadNotification } from '@/lib/emailService';
import fs from 'fs';
import path from 'path';

// POST: Logs downloads (for telemetry/simulations)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, appName, appId, timestamp } = body;

    // Validate request body
    if (!name || !email || (!appName && !appId)) {
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

    const db = await getDb();
    const targetAppId = (appId || appName).toLowerCase().replace(/[^a-z0-9]/g, '-');

    // Find app record to get official name
    const appDoc = await db.collection('application').findOne({
      $or: [
        { appId: targetAppId },
        { name: { $regex: new RegExp(`^${appName}$`, 'i') } }
      ]
    });

    const resolvedName = appDoc?.name || appName || targetAppId;

    // Log to MongoDB downloads collection
    await db.collection('downloads').insertOne({
      name,
      email: email.trim().toLowerCase(),
      appName: resolvedName,
      appId: appDoc?.appId || targetAppId,
      timestamp: timestamp || new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1',
    });

    // Increment downloadsCount in application collection
    let totalDownloads = 1;
    if (appDoc?.appId) {
      const updateResult = await db.collection('application').findOneAndUpdate(
        { appId: appDoc.appId },
        { $inc: { downloadsCount: 1 } },
        { returnDocument: 'after', upsert: true }
      );
      totalDownloads = updateResult?.downloadsCount || (appDoc.downloadsCount || 0) + 1;
    }

    console.log(`[KatyalStore] MongoDB POST Download logged: ${name} (${email}) - ${resolvedName}`);

    // Asynchronously dispatch Neo-Brutalist download notification email
    sendDownloadNotification({
      to: appDoc?.ownerEmail,
      appName: resolvedName,
      appId: appDoc?.appId || targetAppId,
      version: appDoc?.version,
      downloaderName: name,
      downloaderEmail: email,
      totalDownloads,
    }).catch((err) => console.error('[KatyalStore Email] Failed to send POST download notification:', err));

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

    // Connect to database
    const db = await getDb();

    // Query application dynamically from MongoDB
    const appDoc = await db.collection('application').findOne({
      $or: [
        { appId: appId.toLowerCase() },
        { name: { $regex: new RegExp(`^${appId}$`, 'i') } }
      ]
    });

    if (!appDoc) {
      return NextResponse.json(
        { error: `Application '${appId}' not found in inventory` },
        { status: 404 }
      );
    }

    const appName = appDoc.name || appId;
    const fileName = appDoc.fileName || appDoc.s3Key || `${appName}-release.apk`;
    const s3Key = appDoc.s3Key || appDoc.fileName || fileName;

    // Log the download event in downloads collection
    await db.collection('downloads').insertOne({
      name,
      email: email.trim().toLowerCase(),
      appName: appName,
      appId: appDoc.appId || appId.toLowerCase(),
      fileName: fileName,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ipAddress: request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1',
    });

    // Increment downloadsCount in application collection
    const updateResult = await db.collection('application').findOneAndUpdate(
      { appId: appDoc.appId },
      { $inc: { downloadsCount: 1 } },
      { returnDocument: 'after', upsert: true }
    );
    const totalDownloads = updateResult?.downloadsCount || (appDoc.downloadsCount || 0) + 1;

    console.log(`[KatyalStore] MongoDB GET Download logged: ${name} (${email}) - ${appName} [${fileName}]`);

    // Asynchronously dispatch Neo-Brutalist download notification email
    sendDownloadNotification({
      to: appDoc.ownerEmail,
      appName: appName,
      appId: appDoc.appId || appId.toLowerCase(),
      version: appDoc.version,
      downloaderName: name,
      downloaderEmail: email,
      totalDownloads,
    }).catch((err) => console.error('[KatyalStore Email] Failed to send GET download notification:', err));

    // 1. Try to generate presigned S3 URL and redirect if credentials exist
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const getCommand = new GetObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          ResponseContentDisposition: `attachment; filename="${fileName.endsWith('.apk') ? fileName : `${fileName}.apk`}"`,
        });
        const presignedUrl = await getSignedUrl(s3Client, getCommand, { expiresIn: 900 });
        console.log(`[KatyalStore] Generated S3 presigned URL for download: ${presignedUrl}`);
        return NextResponse.redirect(presignedUrl);
      } catch (s3Error) {
        console.error(`[KatyalStore] S3 presigned URL generation failed for ${s3Key}, checking local fallback:`, s3Error);
      }
    }

    // 2. Local fallback streaming if file exists locally
    const possiblePaths = [
      path.join(process.cwd(), 'apks', fileName),
      path.join(process.cwd(), 'apks', `${fileName}.apk`),
      path.join(process.cwd(), 'apks', s3Key),
    ];

    for (const filePath of possiblePaths) {
      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        const fileStream = fs.createReadStream(filePath);
        return new Response(fileStream as any, {
          headers: {
            'Content-Type': 'application/vnd.android.package-archive',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': stat.size.toString(),
          },
        });
      }
    }

    return NextResponse.json(
      { error: `Installer file '${fileName}' is missing from both S3 and local storage` },
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

