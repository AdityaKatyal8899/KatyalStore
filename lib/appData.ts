export interface App {
  id: string;
  name: string;
  category: string;
  size: string;
  description: string;
  teaser: string;
  fullDescription: string;
  icon: string;
}

export const APPS: App[] = [
  {
    id: 'cowatch',
    name: 'CoWatch',
    category: 'Streaming / Social',
    size: '5 MB',
    teaser: 'Stop watching anime alone in the dark while crying.',
    fullDescription: 'Stop watching anime alone in the dark while crying. Bring your friends into a room, stream your favorite videos, and yell at each other over live voice chat in real-time. It\'s a literal theater party in your pocket!',
    icon: '/icons/cowatch.png',
  },
  {
    id: 'fetchflow',
    name: 'FetchFlow',
    category: 'Developer Tools',
    size: '3.8 MB',
    teaser: 'Looking for a place for downloading media without ads? FetchFlow is the one to get this done.',
    fullDescription: 'Frustrated with the ads during downloading your contnet? FetchFlow solves this problem. You can download the reels/YouTube Videos/Audios without watching any ad.',
    icon: '/icons/fetchflow.jpg',
  },
];
