import { NextRequest, NextResponse } from 'next/server';
import { getS3SignedReadUrl, extractS3Key, s3Client, BUCKET_NAME } from '@/lib/s3';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import path from 'path';
import fs from 'fs';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const rawKey = searchParams.get('key') || searchParams.get('url') || searchParams.get('path');

    if (!rawKey) {
      return NextResponse.json({ error: 'Media key or url parameter required' }, { status: 400 });
    }

    const s3Key = extractS3Key(rawKey);

    // 1. Try S3 presigned redirect if AWS credentials exist
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const signedUrl = await getS3SignedReadUrl(s3Key);
        if (signedUrl && signedUrl !== s3Key && signedUrl.includes('X-Amz-Signature=')) {
          return NextResponse.redirect(signedUrl, {
            headers: {
              'Cache-Control': 'public, max-age=604800, s-maxage=604800',
            },
          });
        }
      } catch (err) {
        console.error('[KatyalStore Media] S3 signed URL redirect error:', err);
      }
    }

    // 2. Fallback to local files in public/ or cwd
    const localPaths = [
      path.join(process.cwd(), 'public', s3Key),
      path.join(process.cwd(), s3Key),
    ];

    for (const p of localPaths) {
      if (fs.existsSync(p)) {
        const stat = fs.statSync(p);
        const stream = fs.createReadStream(p);
        const ext = path.extname(p).toLowerCase();
        const contentType =
          ext === '.png'
            ? 'image/png'
            : ext === '.jpg' || ext === '.jpeg'
            ? 'image/jpeg'
            : ext === '.webp'
            ? 'image/webp'
            : ext === '.svg'
            ? 'image/svg+xml'
            : 'application/octet-stream';

        return new Response(stream as any, {
          headers: {
            'Content-Type': contentType,
            'Content-Length': stat.size.toString(),
            'Cache-Control': 'public, max-age=604800',
          },
        });
      }
    }

    return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
  } catch (error) {
    console.error('[KatyalStore Media] GET Error:', error);
    return NextResponse.json({ error: 'Failed to process media asset' }, { status: 500 });
  }
}
