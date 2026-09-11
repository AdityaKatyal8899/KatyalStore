'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { AuthGatekeeper } from '@/components/auth/AuthGatekeeper';
import { ScrollDrivenHeader } from '@/components/layout/ScrollDrivenHeader';
import { AnimatedSearchBar } from '@/components/layout/AnimatedSearchBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarContent } from '@/components/layout/SidebarContent';
import { AppGrid } from '@/components/store/AppGrid';
import { App } from '@/lib/appData';
import { LogOut, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'All',
  'Streaming / Social',
  'Developer Tools',
  'Entertainment',
  'Productivity',
  'Gaming',
];

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarSection, setSidebarSection] = useState<'home' | 'downloads' | 'account' | null>(null);
  const [stats, setStats] = useState({ totalDownloads: 0, totalReviews: 0 });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error('[KatyalStore] Error loading site-wide stats:', e);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const user = localStorage.getItem('katyalstore_user');
    if (user) {
      try {
        setCurrentUser(JSON.parse(user));
        setIsAuthenticated(true);
      } catch (e) {
        console.error('[KatyalStore] Error parsing stored user:', e);
      }
    }
  }, []);

  const handleAuthenticated = (userData: { name: string; email: string }) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('katyalstore_user', JSON.stringify(userData));
  };

  const handleLogOut = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setSidebarOpen(false);
    setSidebarSection(null);
    localStorage.removeItem('katyalstore_user');
    router.push('/');
  };

  const handleAppSelect = (app: App) => {
    router.push(`/app/${app.id || (app as any).appId}`);
  };

  return (
    <>
      <AnimatedBackground />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="auth-gate"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <AuthGatekeeper onAuthenticated={handleAuthenticated} />
          </motion.div>
        ) : (
          <motion.div
            key="store-content"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <ScrollDrivenHeader />
            <AnimatedSearchBar onSearchChange={setSearchQuery} />

            <main className="relative z-10 min-h-screen pt-8 pb-32">
              <div className="max-w-3xl mx-auto px-4 sm:px-6">
                {/* Header section with inline KatyalStore branding */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, type: 'spring', stiffness: 350, damping: 25 }}
                  className="mb-8 pt-8"
                >
                  <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-black leading-tight uppercase tracking-tight">
                    Welcome to{' '}
                    <span className="bg-yellow-300 px-3 py-1 border-4 border-black inline-block transform -rotate-2 shadow-[4px_4px_0px_0px_#000000] mx-1">
                      KatyalStore
                    </span>{' '}
                    <span className="bg-orange-200 border-2 border-black px-2 py-0.5 inline-block transform rotate-1 font-black normal-case">
                      {currentUser?.name}
                    </span>,
                    <div className="mt-4 text-lg md:text-xl font-black bg-orange-100 border-2 border-black px-4 py-2 inline-block shadow-[3px_3px_0px_0px_#000000] uppercase tracking-wide">
                      What&apos;s your vibe:
                    </div>
                  </h1>
                </motion.div>

                {/* Site Stats Banner with Spring Entrance */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.08, type: 'spring', stiffness: 350, damping: 25 }}
                  className="bg-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_#000000] max-w-2xl flex flex-wrap gap-4 items-center justify-between"
                >
                  <div className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-black" />
                    <span>Live Catalog Stats</span>
                  </div>
                  <div className="flex gap-3 text-xs font-black uppercase tracking-tight">
                    <span className="bg-green-300 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                      📥 {stats.totalDownloads} Downloads
                    </span>
                    <span className="bg-blue-300 border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                      💬 {stats.totalReviews} Reviews
                    </span>
                  </div>
                </motion.div>

                {/* Animated Category Filter Pills */}
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, delay: 0.14 }}
                  className="mb-8 max-w-2xl"
                >
                  <div className="flex items-center gap-1.5 mb-2.5">
                    <Filter className="w-3.5 h-3.5 text-black" />
                    <span className="text-xs font-black uppercase tracking-wider text-gray-700">
                      Filter by Vibe / Category:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => {
                      const isActive = selectedCategory === cat;
                      return (
                        <motion.button
                          key={cat}
                          type="button"
                          onClick={() => setSelectedCategory(cat)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.96 }}
                          className={`px-3 py-1.5 text-xs font-black uppercase tracking-tight border-2 border-black transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-yellow-300 shadow-[3px_3px_0px_0px_#000000]'
                              : 'bg-white hover:bg-yellow-100 shadow-[2px_2px_0px_0px_#000000]'
                          }`}
                        >
                          {cat}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>

                {/* Search Info Badge */}
                <AnimatePresence>
                  {searchQuery && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-6 bg-orange-100 border-2 border-black p-3 max-w-2xl flex items-center justify-between"
                    >
                      <p className="text-black font-bold text-xs md:text-sm uppercase tracking-tight">
                        🔍 Results for: &quot;{searchQuery}&quot;
                      </p>
                      <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="text-[10px] font-black uppercase underline hover:bg-yellow-200 px-1"
                      >
                        Clear
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* App grid with Animated transitions */}
                <AppGrid
                  onAppSelect={handleAppSelect}
                  searchQuery={searchQuery}
                  selectedCategory={selectedCategory}
                  onClearFilters={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                  }}
                />
              </div>
            </main>

            {/* Bottom-right Floating Actions (Owner Dashboard + Log Out) */}
            <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2">
              <Link
                href="/dashboard"
                className="bg-yellow-300 border-2 border-black px-3 py-2 font-black text-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-1.5"
                title="Open Owner Dashboard"
              >
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Owner</span>
              </Link>

              <motion.button
                onClick={handleLogOut}
                className="bg-red-400 border-2 border-black px-4 py-2 font-black text-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut className="w-4 h-4" />
                <span>Log Out</span>
              </motion.button>
            </div>

            {!sidebarSection && (
              <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
                onNavigate={(section) => setSidebarSection(section)}
                onLogOut={handleLogOut}
                currentUser={currentUser}
              />
            )}

            <SidebarContent
              section={sidebarSection}
              onClose={() => setSidebarSection(null)}
              currentUser={currentUser}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
