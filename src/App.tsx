/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { auth, signInWithGoogle } from './lib/firebase';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { LogOut, Sparkles, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-main font-sans flex">
      <Toaster position="top-right" theme="dark" />
      <AnimatePresence mode="wait">
        {!user ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full"
          >
            <Auth onLogin={signInWithGoogle} />
          </motion.div>
        ) : (
          <div className="flex w-full">
            {/* Sidebar */}
            <aside className="w-64 bg-sidebar border-r border-border flex flex-col p-6 hidden lg:flex">
              <div className="flex items-center gap-3 mb-10">
                <div className="w-8 h-8 bg-linear-to-br from-primary to-secondary rounded-lg flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="font-extrabold text-xl text-primary tracking-tight">AutoContent</span>
              </div>
              
              <nav className="flex-1">
                <ul className="space-y-2">
                  <li className="flex items-center gap-3 p-3 bg-bg text-primary rounded-xl font-bold cursor-pointer">
                    <LayoutGrid className="w-5 h-5" />
                    Dashboard
                  </li>
                  {['Content Series', 'Media Library', 'Schedules', 'Analytics', 'Settings'].map((item) => (
                    <li key={item} className="flex items-center gap-3 p-3 text-text-muted hover:bg-bg/50 rounded-xl font-semibold cursor-pointer transition-colors">
                      <div className="w-5 h-5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="mt-auto p-4 bg-card-bg rounded-2xl border border-border">
                <p className="text-xs font-bold mb-1 text-text-main">Plan: Creator Pro</p>
                <p className="text-[10px] text-text-muted">12/30 daily posts generated</p>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              <header className="h-16 border-b border-border bg-sidebar/80 backdrop-blur-md flex items-center justify-between px-8 shrink-0">
                <div className="lg:hidden flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  <span className="font-bold text-primary">AutoContent</span>
                </div>
                <div className="hidden lg:block">
                  <h1 className="text-xl font-bold text-text-main">Studio Dashboard</h1>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <img 
                      src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} 
                      alt={user.displayName || 'User'} 
                      className="w-8 h-8 rounded-full border border-border"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-sm font-bold hidden sm:block text-text-main">{user.displayName}</span>
                  </div>
                  <button
                    onClick={() => signOut(auth)}
                    className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted"
                    title="Sign Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </header>

              <main className="flex-1 overflow-y-auto p-8">
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Dashboard user={user} />
                </motion.div>
              </main>
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}



