import { Film, Calendar as CalendarIcon, ChevronRight, MoreVertical } from 'lucide-react';
import { motion } from 'motion/react';

interface SeriesListProps {
  series: any[];
  onSelect: (series: any) => void;
}

export function SeriesList({ series, onSelect }: SeriesListProps) {
  if (series.length === 0) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="w-20 h-20 bg-card-bg rounded-full border border-border flex items-center justify-center mx-auto shadow-sm">
          <Film className="w-10 h-10 text-primary/20" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-text-main">No series yet</h3>
          <p className="text-text-muted max-w-xs mx-auto">Create your first automated content series to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {series.map((s, index) => (
        <motion.div
          key={s.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          onClick={() => onSelect(s)}
          className="group bg-card-bg rounded-[32px] border border-border p-8 hover:shadow-2xl hover:shadow-primary/5 transition-all cursor-pointer relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-6">
            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
              s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-primary/10 text-primary'
            }`}>
              {s.status}
            </div>
            <button className="p-2 hover:bg-bg rounded-full opacity-0 group-hover:opacity-100 transition-all text-text-muted">
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-2xl font-black mb-3 group-hover:text-primary transition-colors line-clamp-1">{s.title}</h3>
          <p className="text-sm text-text-muted line-clamp-2 mb-8 h-10 leading-relaxed">{s.description}</p>

          <div className="flex items-center justify-between pt-6 border-t border-border">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Parts</span>
                <span className="text-lg font-black text-text-main">{s.totalParts}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-text-muted">Posted</span>
                <span className="text-lg font-black text-text-main">0</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-bg flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm group-hover:shadow-lg group-hover:shadow-primary/30">
              <ChevronRight className="w-6 h-6" />
            </div>
          </div>

          {/* Decorative background element */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-linear-to-br from-primary/5 to-secondary/5 rounded-full blur-3xl group-hover:from-primary/10 group-hover:to-secondary/10 transition-all" />
        </motion.div>
      ))}
    </div>
  );
}

