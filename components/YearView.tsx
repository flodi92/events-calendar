
import React from 'react';
import { format, startOfYear, addMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import { CalendarEvent, Organizer } from '../types.ts';
import { ORGANIZER_STYLES } from '../constants.tsx';

interface YearViewProps {
  yearDate: Date;
  events: CalendarEvent[];
  onDayClick: (date: Date) => void;
}

const YearView: React.FC<YearViewProps> = ({ yearDate, events, onDayClick }) => {
  const months = Array.from({ length: 12 }, (_, i) => addMonths(startOfYear(yearDate), i));

  const renderMonth = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);
    const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

    return (
      <div key={monthDate.toString()} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 mb-3 text-center uppercase tracking-wider">
          {format(monthDate, 'MMMM')}
        </h3>
        <div className="grid grid-cols-7 gap-1 text-[10px] text-center mb-2 font-medium text-slate-400">
          <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
        </div>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const isCurrentMonth = isSameMonth(day, monthDate);
            const dayEvents = events.filter(e => isSameDay(new Date(e.date), day));
            const distinctOrganizers = Array.from(new Set(dayEvents.map(e => e.organizer)));

            return (
              <button
                key={day.toString()}
                onClick={() => onDayClick(day)}
                className={`relative h-7 flex flex-col items-center justify-center rounded transition-colors ${
                  !isCurrentMonth ? 'text-slate-300 pointer-events-none' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="z-10">{format(day, 'd')}</span>
                {isCurrentMonth && distinctOrganizers.length > 0 && (
                  <div className="absolute bottom-1 flex gap-0.5 justify-center">
                    {distinctOrganizers.map((org, i) => {
                      const isKnown = Object.values(Organizer).includes(org as Organizer);
                      const color = isKnown ? ORGANIZER_STYLES[org as Organizer].accent : 'bg-slate-400';
                      return (
                        <div 
                          key={i}
                          className={`w-1 h-1 rounded-full ${color}`} 
                        />
                      );
                    })}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4 md:p-8">
      {months.map(renderMonth)}
    </div>
  );
};

export default YearView;
