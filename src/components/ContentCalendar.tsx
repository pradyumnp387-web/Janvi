import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ContentCalendarProps {
  series: any[];
}

export function ContentCalendar({ series }: ContentCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Mock scheduled content for now - in real app we'd fetch all parts for the month
  const scheduledItems = [
    { date: new Date(), title: 'Part 1: The Beginning', type: 'reel' },
    { date: new Date(Date.now() + 86400000), title: 'Part 2: The Journey', type: 'reel' },
  ];

  return (
    <div className="bg-card-bg rounded-3xl border border-border overflow-hidden">
      <div className="p-6 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-black tracking-tight text-text-main">{format(currentDate, 'MMMM yyyy')}</h3>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 hover:bg-bg rounded-full transition-colors text-text-muted"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="py-3 text-center text-[10px] uppercase tracking-widest font-black text-text-muted opacity-60">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 auto-rows-[120px]">
        {/* Empty cells for padding */}
        {Array.from({ length: monthStart.getDay() }).map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-border bg-bg/20" />
        ))}

        {days.map(day => {
          const items = scheduledItems.filter(item => isSameDay(item.date, day));
          return (
            <div key={day.toString()} className="border-r border-b border-border p-2 relative group hover:bg-bg/40 transition-colors">
              <span className={`text-xs font-black ${isToday(day) ? 'bg-primary text-white w-7 h-7 rounded-full flex items-center justify-center shadow-lg shadow-primary/20' : 'text-text-muted opacity-40'}`}>
                {format(day, 'd')}
              </span>
              
              <div className="mt-2 space-y-1">
                {items.map((item, i) => (
                  <div key={i} className="text-[10px] bg-secondary text-white p-1.5 rounded-lg truncate font-black uppercase tracking-tighter">
                    {item.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

