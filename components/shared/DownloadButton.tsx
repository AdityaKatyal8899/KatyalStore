'use client';

import { motion } from 'framer-motion';
import { CloudDownload } from 'lucide-react';
import { useState } from 'react';

interface DownloadButtonProps {
  appName: string;
  onDownloadComplete?: () => void;
}

type DownloadStage = 'idle' | 'connecting' | 'downloading' | 'complete';

export function DownloadButton({ appName, onDownloadComplete }: DownloadButtonProps) {
  const [stage, setStage] = useState<DownloadStage>('idle');
  const [progress, setProgress] = useState(0);

  const handleDownload = async () => {
    if (stage !== 'idle') return;

    // Stage 1: Connecting
    setStage('connecting');
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Stage 2: Downloading with progress
    setStage('downloading');
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    // Stage 3: Complete
    setStage('complete');
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Reset
    setStage('idle');
    setProgress(0);

    // Trigger actual download from our server streaming route!
    const user = localStorage.getItem('katyalstore_user');
    const parsedUser = user ? JSON.parse(user) : null;
    const emailParam = parsedUser ? encodeURIComponent(parsedUser.email) : 'guest@example.com';
    const nameParam = parsedUser ? encodeURIComponent(parsedUser.name) : 'Guest';
    const appId = appName.toLowerCase() === 'cowatch' ? 'cowatch' : 'fetchflow';

    window.location.href = `/api/download?appId=${appId}&email=${emailParam}&name=${nameParam}`;

    if (onDownloadComplete) {
      setTimeout(onDownloadComplete, 1000);
    }
  };

  const getButtonText = () => {
    switch (stage) {
      case 'connecting':
        return 'Connecting...';
      case 'downloading':
        return `Downloading ${progress}%...`;
      case 'complete':
        return 'Installation Complete!';
      default:
        return 'Download APK';
    }
  };

  const getButtonBg = () => {
    switch (stage) {
      case 'connecting':
      case 'downloading':
        return 'bg-blue-400';
      case 'complete':
        return 'bg-green-400';
      default:
        return 'bg-green-400';
    }
  };

  return (
    <motion.button
      onClick={handleDownload}
      disabled={stage !== 'idle'}
      className={`${getButtonBg()} border-4 border-black text-black font-black py-3 px-6 shadow-[4px_4px_0px_0px_#000000] hover:shadow-[6px_6px_0px_0px_#000000] active:shadow-[2px_2px_0px_0px_#000000] transition-shadow transform disabled:opacity-50 w-full flex items-center justify-center gap-2 uppercase tracking-tight text-sm`}
      whileHover={stage === 'idle' ? { scale: 1.02 } : {}}
      whileTap={stage === 'idle' ? { scale: 0.98 } : {}}
    >
      <CloudDownload className="w-4 h-4" />
      {getButtonText()}
    </motion.button>
  );
}
