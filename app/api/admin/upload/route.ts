import { NextRequest, NextResponse } from 'next/server';
import { s3Client, BUCKET_NAME } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { formatExactSize } from '@/lib/appData';
import fs from 'fs';
import path from 'path';

/**
 * Computes S3 key hierarchy:
 * - Icon: {appSlug}/icon.{ext}
 * - APK: {appSlug}/{version}/apk/{fileName}
 * - Screenshots: {appSlug}/{version}/screenshots/{fileName}
 */
export function computeS3Key({
  fileName,
  appId,
  appName,
  version,
  folder,
  type,
  isImage,
}: {
  fileName: string;
  appId?: string;
  appName?: string;
  version?: string;
  folder?: string;
  type?: string;
  isImage?: boolean;
}): { s3Key: string; localRelPath: string; folderType: string } {
  const sanitizedFileName = path.basename(fileName);
  const rawApp = appId || appName || '';
  const appSlug = rawApp.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/^-+|-+$/g, '') || 'general';
  const cleanVersion = (version || 'v1.0.0').replace(/[^a-zA-Z0-9._-]/g, '') || 'v1.0.0';

  const determinedType =
    type ||
    folder ||
    (sanitizedFileName.startsWith('screenshot-') ? 'screenshots' : isImage ? 'icon' : 'apk');

  if (determinedType === 'icon' || determinedType === 'icons') {
    const ext = path.extname(sanitizedFileName) || '.png';
    const s3Key = `${appSlug}/icon${ext}`;
    const localRelPath = `icons/${appSlug}-icon${ext}`;
    return { s3Key, localRelPath, folderType: 'icons' };
  }

  if (determinedType === 'screenshots') {
    const s3Key = `${appSlug}/${cleanVersion}/screenshots/${sanitizedFileName}`;
    const localRelPath = `screenshots/${appSlug}/${cleanVersion}/${sanitizedFileName}`;
    return { s3Key, localRelPath, folderType: 'screenshots' };
  }

  if (determinedType === 'apk' || determinedType === 'apks') {
    const s3Key = `${appSlug}/${cleanVersion}/apk/${sanitizedFileName}`;
    const localRelPath = `apks/${appSlug}/${cleanVersion}/apk/${sanitizedFileName}`;
    return { s3Key, localRelPath, folderType: 'apk' };
  }

  // If a multi-level custom folder was explicitly passed
  if (folder && folder.includes('/')) {
    const s3Key = `${folder.replace(/^\/+|\/+$/g, '')}/${sanitizedFileName}`;
    return { s3Key, localRelPath: s3Key, folderType: folder };
  }

  const s3Key = `${appSlug}/${cleanVersion}/${determinedType}/${sanitizedFileName}`;
  return { s3Key, localRelPath: s3Key, folderType: determinedType };
}

// 1. GET: Generate S3 Presigned Upload URL with app/version folder hierarchy
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');
    const appId = searchParams.get('appId') || '';
    const appName = searchParams.get('appName') || '';
    const version = searchParams.get('version') || '';
    const folder = searchParams.get('folder') || '';
    const type = searchParams.get('type') || '';
    const contentType = searchParams.get('contentType') || 'application/vnd.android.package-archive';

    if (!fileName) {
      return NextResponse.json({ error: 'fileName query param required' }, { status: 400 });
    }

    const isImage = contentType.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(fileName);
    const { s3Key, folderType } = computeS3Key({
      fileName,
      appId,
      appName,
      version,
      folder,
      type,
      isImage,
    });

    const region = process.env.AWS_REGION || 'ap-south-1';

    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      const command = new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        ContentType: contentType,
      });

      // 15 minutes expiration for uploading
      const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 900 });
      const publicS3Url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;

      return NextResponse.json({
        success: true,
        uploadUrl,
        key: s3Key,
        s3Key,
        fileName: path.basename(fileName),
        s3Url: publicS3Url,
        url: publicS3Url,
        folder: folderType,
        bucket: BUCKET_NAME,
      });
    }

    return NextResponse.json(
      { error: 'AWS S3 credentials not configured on server' },
      { status: 500 }
    );
  } catch (error) {
    console.error('[KatyalStore Upload] Presigned URL Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

// 2. POST: Direct server-side upload via multipart/form-data (Screenshots, Icons, APKs)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customName = formData.get('customName') as string | null;
    const appId = (formData.get('appId') as string) || '';
    const appName = (formData.get('appName') as string) || '';
    const version = (formData.get('version') as string) || '';
    const specifiedFolder = (formData.get('folder') as string) || '';
    const specifiedType = (formData.get('type') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form-data' }, { status: 400 });
    }

    const originalName = file.name;
    const finalFileName = customName || originalName;
    const sanitizedFileName = path.basename(finalFileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const sizeFormatted = formatExactSize(buffer.length);
    const region = process.env.AWS_REGION || 'ap-south-1';

    const isImage = file.type.startsWith('image/') || /\.(png|jpg|jpeg|webp|svg)$/i.test(sanitizedFileName);

    const { s3Key, localRelPath, folderType } = computeS3Key({
      fileName: sanitizedFileName,
      appId,
      appName,
      version,
      folder: specifiedFolder,
      type: specifiedType,
      isImage,
    });

    const publicS3Url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Key}`;

    // 1. Try uploading to AWS S3 if credentials exist
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const command = new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type || (isImage ? 'image/png' : 'application/vnd.android.package-archive'),
        });

        await s3Client.send(command);
        console.log(`[KatyalStore S3] Uploaded to S3: ${s3Key} (${sizeFormatted}) in bucket ${BUCKET_NAME}`);

        return NextResponse.json({
          success: true,
          fileName: sanitizedFileName,
          key: s3Key,
          s3Key: s3Key,
          url: publicS3Url,
          iconUrl: isImage ? publicS3Url : undefined,
          size: sizeFormatted,
          bytes: buffer.length,
          folder: folderType,
          storage: 's3',
        });
      } catch (s3Error) {
        console.error('[KatyalStore Upload] S3 PutObject failed, falling back to local storage:', s3Error);
      }
    }

    // 2. Fallback to local storage (mirrors folder hierarchy)
    const localTargetBase = isImage
      ? path.join(process.cwd(), 'public')
      : path.join(process.cwd());

    const localFilePath = path.join(localTargetBase, localRelPath);
    const targetDir = path.dirname(localFilePath);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    fs.writeFileSync(localFilePath, buffer);
    const localUrl = isImage ? `/${localRelPath}` : `/${localRelPath}`;
    console.log(`[KatyalStore Local] Saved ${sanitizedFileName} (${sizeFormatted}) to ${localFilePath}`);

    return NextResponse.json({
      success: true,
      fileName: sanitizedFileName,
      key: s3Key,
      s3Key: s3Key,
      url: localUrl,
      iconUrl: isImage ? localUrl : undefined,
      size: sizeFormatted,
      bytes: buffer.length,
      folder: folderType,
      storage: 'local',
    });
  } catch (error) {
    console.error('[KatyalStore Upload] POST Error:', error);
    return NextResponse.json(
      { error: 'Failed to process file upload' },
      { status: 500 }
    );
  }
}
