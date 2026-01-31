import React from 'react';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { CalendarEvent, SourceConfig } from '../types.ts';
import EventCard from './EventCard.tsx';

interface WeekViewProps {
  weekDate: Date;
  events: CalendarEvent[];
  selectedIds: Set<string>;
  onToggleSelection: (id: string) => void;
  sourcesConfig: SourceConfig[];
}

const WeekView: React.FC<WeekViewProps> = ({ weekDate, events, selectedIds, onToggleSelection, sourcesConfig }) => {
  const start = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

  return (
    <div className="flex flex-col md:flex-row md:overflow-x-auto min-h-[calc(100vh-120px)] bg-slate-50">
      {weekDays.map((day) => {
        const dayEvents = events.filter(e => isSameDay(new Date(e.date), day))
          .sort((a, b) => a.time.localeCompare(b.time));
        const isToday = isSameDay(day, new Date());

        return (
          <div 
            key={day.toString()} 
            className={`flex-1 min-w-[300px] border-r border-slate-200 flex flex-col ${isToday ? 'bg-blue-50/20' : 'bg-white'}`}
          >
            <div className={`p-5 sticky top-0 z-10 border-b border-slate-100 ${isToday ? 'bg-blue-50/40 backdrop-blur-sm' : 'bg-white'}`}>
              <div className="flex flex-col items-center">
                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>
                  {format(day, 'EEEE')}
                </span>
                <span className={`text-3xl font-black mt-1 ${isToday ? 'text-blue-900' : 'text-slate-900'}`}>
                  {format(day, 'd')}
                </span>
                {isToday && <div className="h-1.5 w-6 bg-blue-500 rounded-full mt-2" />}
              </div>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              {dayEvents.length > 0 ? (
                dayEvents.map(event => (
                  <EventCard 
                    key={event.id} 
                    event={event} 
                    isSelected={selectedIds.has(event.id)}
                    onToggle={onToggleSelection}
                    sourcesConfig={sourcesConfig}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-48 text-slate-300 italic text-xs">
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3">
                    <span className="text-lg opacity-40">∅</span>
                  </div>
                  <span>Empty Day</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeekView;
