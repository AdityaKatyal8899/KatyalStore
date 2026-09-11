import { useState, useEffect } from 'react';
import { App, APPS } from '@/lib/appData';
import { AppCard } from './AppCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, SearchX } from 'lucide-react';

interface AppGridProps {
  onAppSelect: (app: App) => void;
  searchQuery: string;
  selectedCategory?: string;
  onClearFilters?: () => void;
}

export function AppGrid({
  onAppSelect,
  searchQuery,
  selectedCategory = 'All',
  onClearFilters,
}: AppGridProps) {
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

  const filteredApps = appsList.filter((app) => {
    if (!app) return false;
    const name = (app.name || '').toLowerCase();
    const category = (app.category || '').toLowerCase();
    const query = (searchQuery || '').toLowerCase();

    const matchesSearch = !query || name.includes(query) || category.includes(query);
    const matchesCategory =
      !selectedCategory ||
      selectedCategory === 'All' ||
      category.toLowerCase() === selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-4 border-black p-8 text-center font-black uppercase text-sm shadow-[6px_6px_0px_0px_#000000] max-w-2xl flex items-center justify-center gap-2"
      >
        <Sparkles className="w-5 h-5 text-black animate-spin" />
        <span>Loading store catalog vibes...</span>
      </motion.div>
    );
  }

  if (filteredApps.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-yellow-50 border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_#000000] max-w-2xl space-y-4"
      >
        <div className="w-12 h-12 bg-yellow-300 border-2 border-black flex items-center justify-center mx-auto shadow-[2px_2px_0px_0px_#000000]">
          <SearchX className="w-6 h-6 text-black" />
        </div>
        <div>
          <h4 className="text-lg font-black uppercase tracking-tight text-black">
            No Apps Found
          </h4>
          <p className="text-xs font-bold text-gray-700 uppercase mt-1">
            No applications match &quot;{searchQuery || selectedCategory}&quot;
          </p>
        </div>
        {onClearFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="bg-black text-white px-4 py-2 text-xs font-black uppercase border-2 border-black hover:bg-yellow-300 hover:text-black hover:shadow-[3px_3px_0px_0px_#000000] transition-all cursor-pointer"
          >
            Clear Search & Filters
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div layout className="flex flex-col gap-6 max-w-2xl">
      <AnimatePresence mode="popLayout">
        {filteredApps.map((app, index) => (
          <motion.div
            key={app.id || (app as any).appId}
            layout
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.94, y: -15 }}
            transition={{
              type: 'spring',
              stiffness: 350,
              damping: 28,
              delay: index * 0.04,
            }}
          >
            <AppCard app={app} onClick={onAppSelect} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
