import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { APPS, formatExactSize } from '@/lib/appData';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Fetch apps from MongoDB application collection
    let dbApps = await db.collection('application').find({}).toArray();

    // Auto-seed initial catalog from APPS if MongoDB collection is empty
    if (dbApps.length === 0) {
      for (const app of APPS) {
        await db.collection('application').updateOne(
          { appId: app.id },
          {
            $setOnInsert: {
              appId: app.id,
              name: app.name,
              category: app.category,
              size: app.size,
              teaser: app.teaser,
              fullDescription: app.fullDescription,
              icon: app.icon,
              version: app.version || 'v1.0.1',
              fileName: app.fileName || `${app.name}-release.apk`,
              s3Key: app.s3Key || app.fileName || `${app.name}-release.apk`,
              screenshots: app.screenshots || [],
              downloadsCount: 0,
              reviewsCount: 0,
              averageRating: 5.0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          },
          { upsert: true }
        );
      }
      dbApps = await db.collection('application').find({}).toArray();
    }

    const updatedApps = await Promise.all(
      dbApps.map(async (app) => {
        const fallbackStatic = APPS.find((a) => a.id === (app.appId || app.id)) || ({} as any);
        const resolvedName = app.name || fallbackStatic.name || app.appId || 'Unknown App';
        const resolvedCategory = app.category || fallbackStatic.category || 'General';
        const resolvedTeaser = app.teaser || fallbackStatic.teaser || 'Experience this app';
        const resolvedDescription = app.fullDescription || fallbackStatic.fullDescription || app.description || '';
        const resolvedIcon = app.icon || fallbackStatic.icon || '/placeholder-logo.png';
        const resolvedVersion = app.version || fallbackStatic.version || 'v1.0.0';
        const resolvedFileName = app.fileName || fallbackStatic.fileName || `${resolvedName}-release.apk`;
        const resolvedS3Key = app.s3Key || fallbackStatic.s3Key || resolvedFileName;
        const resolvedScreenshots = app.screenshots || fallbackStatic.screenshots || [];
        let preciseSize = app.size || fallbackStatic.size || '10.0 MB';

        if (resolvedS3Key) {
          // 1. Try to fetch real size from AWS S3
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
              const headCommand = new HeadObjectCommand({
                Bucket: BUCKET_NAME,
                Key: resolvedS3Key,
              });
              const headResult = await s3Client.send(headCommand);
              if (headResult.ContentLength) {
                preciseSize = formatExactSize(headResult.ContentLength);
              }
            } catch (s3Error) {
              // Non-blocking fallback
            }
          }
          
          // 2. Try to fallback to local file system in apks/
          if (preciseSize === (app.size || fallbackStatic.size)) {
            const filePath = path.join(process.cwd(), 'apks', resolvedFileName);
            if (fs.existsSync(filePath)) {
              const stat = fs.statSync(filePath);
              preciseSize = formatExactSize(stat.size);
            }
          }
        }

        // Dynamically count reviews and calculate average rating from reviews collection
        const reviews = await db.collection('reviews').find({ appName: resolvedName }).toArray();
        const reviewsCount = reviews.length;
        const averageRating = reviewsCount > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount
          : (app.averageRating || 5.0);

        // Permanently persist all resolved fields to MongoDB
        await db.collection('application').updateOne(
          { appId: app.appId || app.id },
          {
            $set: {
              name: resolvedName,
              category: resolvedCategory,
              teaser: resolvedTeaser,
              fullDescription: resolvedDescription,
              icon: resolvedIcon,
              version: resolvedVersion,
              fileName: resolvedFileName,
              s3Key: resolvedS3Key,
              screenshots: resolvedScreenshots,
              reviewsCount,
              averageRating,
              size: preciseSize,
            },
          }
        );

        return {
          id: app.appId || app.id,
          appId: app.appId || app.id,
          name: resolvedName,
          category: resolvedCategory,
          size: preciseSize,
          teaser: resolvedTeaser,
          fullDescription: resolvedDescription,
          icon: resolvedIcon,
          version: resolvedVersion,
          fileName: resolvedFileName,
          s3Key: resolvedS3Key,
          releaseNotes: app.releaseNotes || 'Latest release',
          screenshots: app.screenshots || fallbackStatic.screenshots || [],
          downloadsCount: app.downloadsCount || 0,
          reviewsCount,
          averageRating,
          updatedAt: app.updatedAt,
          createdAt: app.createdAt,
        };
      })
    );



    return NextResponse.json(updatedApps);
  } catch (error) {
    console.error('[KatyalStore] API apps GET Error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve application metadata' },
      { status: 500 }
    );
  }
}

