'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatedBackground } from '@/components/layout/AnimatedBackground';
import { AuthGatekeeper } from '@/components/auth/AuthGatekeeper';
import { ScrollDrivenHeader } from '@/components/layout/ScrollDrivenHeader';
import { AnimatedSearchBar } from '@/components/layout/AnimatedSearchBar';
import { Sidebar } from '@/components/layout/Sidebar';
import { SidebarContent } from '@/components/layout/SidebarContent';
import { AppGrid } from '@/components/store/AppGrid';
import { App } from '@/lib/appData';
import { LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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

  const handleHomeClick = () => {
    setSidebarSection('home');
  };

  const handleDownloadsClick = () => {
    setSidebarSection('downloads');
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
    router.push(`/app/${app.id}`);
  };

  return (
    <>
      <AnimatedBackground />
      
      {!isAuthenticated && (
        <AuthGatekeeper onAuthenticated={handleAuthenticated} />
      )}

      {isAuthenticated && (
        <>
          <ScrollDrivenHeader />
          <AnimatedSearchBar onSearchChange={setSearchQuery} />

          <main className="relative z-10 min-h-screen pt-8 pb-32">
            <div className="max-w-3xl mx-auto px-4 sm:px-6">
              {/* Header section with inline KatyalStore branding */}
              <div className="mb-12 pt-8">
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
              </div>

              {/* Site Stats Banner */}
              <div className="bg-white border-4 border-black p-4 mb-8 shadow-[6px_6px_0px_0px_#000000] max-w-2xl flex flex-wrap gap-4 items-center justify-between">
                <div className="text-xs font-black uppercase tracking-wider text-black">
                  🏪 Store Catalog Stats
                </div>
                <div className="flex gap-4 text-xs font-black uppercase tracking-tight">
                  <span className="bg-green-300 border border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                    📥 {stats.totalDownloads} Downloads
                  </span>
                  <span className="bg-blue-300 border border-black px-3 py-1.5 shadow-[2px_2px_0px_0px_#000000]">
                    💬 {stats.totalReviews} Reviews
                  </span>
                </div>
              </div>

              {/* Search info */}
              {searchQuery && (
                <div className="mb-6 bg-orange-100 border-2 border-black p-3">
                  <p className="text-black font-bold text-sm uppercase tracking-tight">
                    Search results for: &quot;{searchQuery}&quot;
                  </p>
                </div>
              )}

              {/* App grid */}
              <AppGrid onAppSelect={handleAppSelect} searchQuery={searchQuery} />
            </div>
          </main>

          <motion.button
            onClick={handleLogOut}
            className="fixed bottom-4 right-4 z-50 bg-red-400 border-2 border-black px-4 py-2 font-black text-black uppercase tracking-tight text-xs md:text-sm hover:shadow-[4px_4px_0px_0px_#000000] active:shadow-[1px_1px_0px_0px_#000000] transition-shadow flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out</span>
          </motion.button>

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
        </>
      )}
    </>
  );
}
