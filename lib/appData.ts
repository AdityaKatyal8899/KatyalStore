export interface App {
  id: string;
  name: string;
  category: string;
  size: string;
  description?: string;
  teaser: string;
  fullDescription: string;
  icon: string;
  version?: string;
  fileName?: string;
  s3Key?: string;
  downloadsCount?: number;
  reviewsCount?: number;
  averageRating?: number;
  releaseNotes?: string;
  screenshots?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export function formatExactSize(bytes: number): string {
  if (!bytes || isNaN(bytes) || bytes <= 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) {
    const kb = (bytes / 1024).toFixed(1);
    return kb.endsWith('.0') ? `${Math.round(bytes / 1024)} KB` : `${kb} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    const mb = (bytes / (1024 * 1024)).toFixed(1);
    return `${mb} MB`;
  }
  const gb = (bytes / (1024 * 1024 * 1024)).toFixed(2);
  return `${gb} GB`;
}

export const APPS: App[] = [
  {
    id: 'cowatch',
    name: 'CoWatch',
    category: 'Streaming / Social',
    size: '4.4 MB',
    teaser: 'Stop watching anime alone in the dark while crying.',
    fullDescription: 'Stop watching anime alone in the dark while crying. Bring your friends into a room, stream your favorite videos, and yell at each other over live voice chat in real-time. It\'s a literal theater party in your pocket!',
    icon: '/icons/cowatch.png',
    version: 'v1.0.1',
    fileName: 'CoWatch-Latest-release-v1.0.1',
    s3Key: 'CoWatch-Latest-release-v1.0.1',
    downloadsCount: 0,
    reviewsCount: 0,
    averageRating: 5.0,
  },
  {
    id: 'fetchflow',
    name: 'FetchFlow',
    category: 'Developer Tools',
    size: '106.8 MB',
    teaser: 'Looking for a place for downloading media without ads? FetchFlow is the one to get this done.',
    fullDescription: 'Frustrated with the ads during downloading your contnet? FetchFlow solves this problem. You can download the reels/YouTube Videos/Audios without watching any ad.',
    icon: '/icons/fetchflow.jpg',
    version: 'v1.0.1',
    fileName: 'FetchFlow-android-v.1.0.1.apk',
    s3Key: 'FetchFlow-android-v.1.0.1.apk',
    downloadsCount: 0,
    reviewsCount: 0,
    averageRating: 5.0,
  },
];

