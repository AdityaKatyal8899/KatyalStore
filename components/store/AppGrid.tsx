'use client';

import { useState, useEffect } from 'react';
import { App, APPS } from '@/lib/appData';
import { AppCard } from './AppCard';
import { motion } from 'framer-motion';

interface AppGridProps {
  onAppSelect: (app: App) => void;
  searchQuery: string;
}

export function AppGrid({ onAppSelect, searchQuery }: AppGridProps) {
  const [appsList, setAppsList] = useState<App[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        const res = await fetch('/api/apps');
        if (res.ok) {
          const data = await res.json();
          setAppsList(data);
        } else {
          setAppsList(APPS);
        }
      } catch (e) {
        console.error('[KatyalStore] Error loading apps grid:', e);
        setAppsList(APPS); // fallback to static metadata
      } finally {
        setIsLoading(false);
      }
    };

    fetchApps();
  }, []);

  const filteredApps = appsList.filter((app) =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-black p-6 text-center font-bold shadow-[4px_4px_0px_0px_#000000] max-w-2xl">
        Loading vibes catalog...
      </div>
    );
  }

  return (
    <motion.div
      className="flex flex-col gap-6 max-w-2xl"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {filteredApps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onClick={onAppSelect}
        />
      ))}
    </motion.div>
  );
}
