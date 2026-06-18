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
    teaser: 'The ultimate asset pipeline router.',
    fullDescription: 'The ultimate asset pipeline router. Stop wrestling with chaotic networking threads—let your streams flow smoothly where they belong, completely automated.',
    icon: '/icons/fetchflow.jpg',
  },
];
