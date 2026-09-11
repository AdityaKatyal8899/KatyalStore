import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const BUCKET_NAME =
  process.env.AWS_BUCKET_NAME ||
  process.env.AWS_S3_BUCKET_NAME ||
  'katyalstore';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

/**
 * Extracts S3 key from either a full S3 URL or a raw key path.
 */
export function extractS3Key(keyOrUrl: string): string {
  if (!keyOrUrl) return '';
  if (keyOrUrl.startsWith('http://') || keyOrUrl.startsWith('https://')) {
    try {
      const parsed = new URL(keyOrUrl);
      return parsed.pathname.replace(/^\/+/, '');
    } catch {
      return keyOrUrl.replace(/^https?:\/\/[^/]+\//, '');
    }
  }
  return keyOrUrl.replace(/^\/+/, '');
}

/**
 * Generates an S3 presigned GET URL for public serving if AWS credentials are configured.
 * Fallbacks to original URL/path if credentials not configured or local path.
 */
export async function getS3SignedReadUrl(keyOrUrl: string, expiresIn = 604800): Promise<string> {
  if (!keyOrUrl) return '';
  
  // If it's a relative path (/icons/..., /screenshots/..., /placeholder...), return as is
  if (keyOrUrl.startsWith('/') && !keyOrUrl.startsWith('//')) {
    return keyOrUrl;
  }

  // If already signed with valid signature parameters, return as is
  if (keyOrUrl.includes('X-Amz-Signature=')) {
    return keyOrUrl;
  }

  // If AWS credentials not configured, return as is
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    return keyOrUrl;
  }

  try {
    const key = extractS3Key(keyOrUrl);
    if (!key) return keyOrUrl;

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (err) {
    console.error(`[KatyalStore S3] Error generating signed read URL for ${keyOrUrl}:`, err);
    return keyOrUrl;
  }
}

