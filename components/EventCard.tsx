
import React from 'react';
import { CalendarEvent, Organizer } from '../types.ts';
import { ORGANIZER_STYLES } from '../constants.tsx';
import { Clock, MapPin, ExternalLink, Check } from 'lucide-react';

interface EventCardProps {
  event: CalendarEvent;
  isSelected: boolean;
  onToggle: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ event, isSelected, onToggle }) => {
  // Check if organizer is a known enum value, otherwise provide default styling
  const isKnownOrganizer = Object.values(Organizer).includes(event.organizer as Organizer);
  const styles = isKnownOrganizer 
    ? ORGANIZER_STYLES[event.organizer as Organizer] 
    : {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        accent: 'bg-slate-600'
      };

  const organizerContent = (
    <span className={`text-[10px] uppercase font-black tracking-widest ${styles.text} flex items-center gap-1`}>
      {event.organizer}
      {event.url && <ExternalLink size={8} className="opacity-40" />}
    </span>
  );

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${event.location} ${event.organizer}`)}`;

  // Change by luminance/value: 50 -> 200/300 for bg, border 200 -> 400
  const selectedClasses = isSelected 
    ? `${styles.bg.replace('50', '200')} ${styles.border.replace('200', '400')} ring-1 ring-inset ring-slate-900/10 shadow-md`
    : `${styles.bg} ${styles.border}`;

  return (
    <div className={`relative p-4 rounded-xl border-l-4 transition-all duration-300 group flex gap-3 ${selectedClasses}`}>
      <div className="flex flex-col items-center pt-1 shrink-0">
        <button
          onClick={() => onToggle(event.id)}
          className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
            isSelected 
              ? 'bg-blue-600 border-blue-600 text-white shadow-sm' 
              : 'border-slate-300 bg-white hover:border-slate-400'
          }`}
        >
          {isSelected && <Check size={10} strokeWidth={4} />}
        </button>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1.5">
          {event.url ? (
            <a 
              href={event.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:opacity-70 transition-opacity"
              title={`Visit ${event.organizer} website`}
            >
              {organizerContent}
            </a>
          ) : (
            organizerContent
          )}
          <div className={`flex items-center text-[9px] font-bold tracking-tighter ${isSelected ? 'text-slate-900' : 'text-slate-500'}`}>
            <Clock size={10} className="mr-1" />
            {event.time || '19:30'}
          </div>
        </div>
        
        <h4 className={`text-xs font-black leading-tight mb-2 line-clamp-2 tracking-tight ${isSelected ? 'text-black' : 'text-slate-900'}`}>
          {event.title}
        </h4>
        
        <a 
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center text-[10px] transition-colors group/loc ${isSelected ? 'text-slate-800 font-bold' : 'text-slate-500 font-medium'}`}
          title="Open in Google Maps"
        >
          <MapPin size={10} className={`mr-1 shrink-0 ${isSelected ? 'text-slate-700' : 'text-slate-400'} group-hover/loc:text-blue-500`} />
          <span className="truncate">{event.location}</span>
        </a>
      </div>
    </div>
  );
};

export default EventCard;
