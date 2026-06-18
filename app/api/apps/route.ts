import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { APPS } from '@/lib/appData';
import { s3Client } from '@/lib/s3';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// Helper to format bytes to MB
function formatBytes(bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    
    // Build paths to actual files in S3 or local apks folder
    const apkFilenames: Record<string, string> = {
      'cowatch': 'CoWatch-Latest-release.apk',
      'fetchflow': 'FetchFlow-android-v.1.0.1.apk',
    };

    const updatedApps = await Promise.all(
      APPS.map(async (app) => {
        let preciseSize = app.size; // fallback
        
        const fileName = apkFilenames[app.id];
        if (fileName) {
          // 1. Try to fetch from S3
          if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
            try {
              const headCommand = new HeadObjectCommand({
                Bucket: process.env.AWS_S3_BUCKET_NAME || 'katyalstore',
                Key: fileName,
              });
              const headResult = await s3Client.send(headCommand);
              if (headResult.ContentLength) {
                preciseSize = formatBytes(headResult.ContentLength);
              }
            } catch (s3Error) {
              console.warn(`[KatyalStore] S3 HeadObject failed for ${fileName}, falling back to local files:`, s3Error);
            }
          }
          
          // 2. Try to fallback to local file system
          if (preciseSize === app.size) {
            const filePath = path.join(process.cwd(), 'apks', fileName);
            if (fs.existsSync(filePath)) {
              const stat = fs.statSync(filePath);
              preciseSize = formatBytes(stat.size);
            }
          }
        }

        // Fetch downloads count from application collection
        const dbStats = await db.collection('application').findOne({ appId: app.id }) || { downloadsCount: 0 };

        // Dynamically count reviews and calculate average rating from reviews collection
        const reviews = await db.collection('reviews').find({ appName: app.name }).toArray();
        const reviewsCount = reviews.length;
        const averageRating = reviewsCount > 0
          ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviewsCount
          : 0;

        // Save back to application collection to ensure collection stats are always in sync
        await db.collection('application').updateOne(
          { appId: app.id },
          { $set: { reviewsCount, averageRating } },
          { upsert: true }
        );

        return {
          ...app,
          size: preciseSize,
          downloadsCount: dbStats.downloadsCount || 0,
          reviewsCount,
          averageRating,
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
