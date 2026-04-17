import { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { CreateSeries } from './CreateSeries';
import { SeriesList } from './SeriesList';
import { SeriesDetail } from './SeriesDetail';
import { ContentCalendar } from './ContentCalendar';
import { Plus, LayoutGrid, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardProps {
  user: User;
}

export function Dashboard({ user }: DashboardProps) {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedSeries, setSelectedSeries] = useState<any | null>(null);
  const [series, setSeries] = useState<any[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, 'series'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const seriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSeries(seriesData);
    });

    return () => unsubscribe();
  }, [user.uid]);

  if (selectedSeries) {
    return (
      <SeriesDetail 
        series={selectedSeries} 
        onBack={() => setSelectedSeries(null)} 
      />
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Studio Dashboard</h2>
          <p className="text-text-muted">Manage your AI-powered multi-part series</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-card-bg p-1.5 rounded-full border border-border flex shadow-sm">
            <button
              onClick={() => setView('list')}
              className={`p-2 rounded-full transition-all ${view === 'list' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-bg'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`p-2 rounded-full transition-all ${view === 'calendar' ? 'bg-primary text-white shadow-md' : 'text-text-muted hover:bg-bg'}`}
            >
              <Calendar className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="bg-linear-to-r from-primary to-secondary text-white px-6 py-3 rounded-full flex items-center gap-2 hover:opacity-90 transition-all font-bold shadow-lg shadow-primary/20"
          >
            <Plus className="w-5 h-5" />
            <span>New Series</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <SeriesList series={series} onSelect={setSelectedSeries} />
          </motion.div>
        ) : (
          <motion.div
            key="calendar"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <ContentCalendar series={series} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreating && (
          <CreateSeries 
            user={user} 
            onClose={() => setIsCreating(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
