import React, { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, addYears, subYears } from 'date-fns';
import { CalendarEvent, ViewMode, GroundingSource, SourceConfig } from './types.ts';
import { fetchEventsFromWeb } from './services/geminiService';
import CalendarHeader from './components/CalendarHeader';
import YearView from './components/YearView';
import WeekView from './components/WeekView';
import SourceManager from './components/SourceManager';
import { AlertCircle, Calendar, Sparkles, Download } from 'lucide-react';

const STORAGE_KEY = 'leipzig_calendar_sources_v1';

const DEFAULT_SOURCES: SourceConfig[] = [
  { id: 'eumeniden', url: 'https://theatereumeniden.de/spielplan/', active: true },
  { id: 'gewandhaus', url: 'https://www.gewandhausorchester.de/', active: true },
  { id: 'anker', url: 'https://anker-leipzig.de/va/veranstaltungen/', active: true }
];

const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [sourcesConfig, setSourcesConfig] = useState<SourceConfig[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SOURCES;
    } catch {
      return DEFAULT_SOURCES;
    }
  });
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sourcesConfig));
  }, [sourcesConfig]);

  const updateEvents = useCallback(async () => {
    const activeUrls = sourcesConfig.filter(s => s.active).map(s => s.url);
    if (activeUrls.length === 0) {
      setEvents([]);
      setSources([]);
      setSelectedEventIds(new Set());
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const { events: data, sources: newSources } = await fetchEventsFromWeb(activeUrls);
      setEvents(data);
      setSources(newSources);
      setSelectedEventIds(prev => {
        const next = new Set<string>();
        data.forEach(e => { if (prev.has(e.id)) next.add(e.id); });
        return next;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to synchronize events. Please check your connection or API key.");
    } finally {
      setIsLoading(false);
    }
  }, [sourcesConfig]);

  useEffect(() => {
    updateEvents();
  }, [updateEvents]);

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'week') {
      setCurrentDate(prev => direction === 'prev' ? subWeeks(prev, 1) : addWeeks(prev, 1));
    } else {
      setCurrentDate(prev => direction === 'prev' ? subYears(prev, 1) : addYears(prev, 1));
    }
  };

  const handleDayClick = (date: Date) => {
    setCurrentDate(date);
    setViewMode('week');
  };

  const toggleEventSelection = (id: string) => {
    setSelectedEventIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExport = () => {
    const selectedEvents = events.filter(e => selectedEventIds.has(e.id));
    if (selectedEvents.length === 0) return;

    let icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Leipzig Cultural Calendar//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH'
    ];

    selectedEvents.forEach(event => {
      const datePart = event.date.replace(/-/g, '');
      const timePart = (event.time || '19:30').replace(/:/g, '') + '00';
      const startDateTime = `${datePart}T${timePart}`;
      const endHour = parseInt((event.time || '19:30').split(':')[0]) + 2;
      const endDateTime = `${datePart}T${endHour.toString().padStart(2, '0')}${timePart.substring(2)}`;

      icsContent.push('BEGIN:VEVENT');
      icsContent.push(`UID:${event.id}@cultural-calendar`);
      icsContent.push(`DTSTAMP:${format(new Date(), "yyyyMMdd'T'HHmmss'Z'")}`);
      icsContent.push(`DTSTART:${startDateTime}`);
      icsContent.push(`DTEND:${endDateTime}`);
      icsContent.push(`SUMMARY:${event.title}`);
      icsContent.push(`LOCATION:${event.location}`);
      icsContent.push(`DESCRIPTION:Organizer: ${event.organizer}\\nURL: ${event.url || 'N/A'}`);
      if (event.url) icsContent.push(`URL:${event.url}`);
      icsContent.push('END:VEVENT');
    });

    icsContent.push('END:VCALENDAR');

    const blob = new Blob([icsContent.join('\r\n')], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `selected-events-${format(new Date(), 'yyyy-MM-dd')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getHeaderLabel = () => {
    if (viewMode === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 });
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      if (start.getMonth() === end.getMonth()) {
        return format(start, 'MMMM yyyy');
      }
      return `${format(start, 'MMM')} - ${format(end, 'MMM yyyy')}`;
    }
    return format(currentDate, 'yyyy');
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-900 bg-[#f8fafc]">
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        currentDate={currentDate}
        onNavigate={handleNavigate}
        onRefresh={updateEvents}
        onOpenSources={() => setIsSourceModalOpen(true)}
        onExport={handleExport}
        selectedCount={selectedEventIds.size}
        isLoading={isLoading}
        label={getHeaderLabel()}
      />

      <main className="flex-1 flex flex-col relative">
        {error && (
          <div className="m-4 md:m-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertCircle size={20} className="shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        <div className="flex-1">
          {viewMode === 'year' ? (
            <YearView 
              yearDate={currentDate} 
              events={events} 
              onDayClick={handleDayClick} 
              sourcesConfig={sourcesConfig}
            />
          ) : (
            <WeekView 
              weekDate={currentDate} 
              events={events}
              selectedIds={selectedEventIds}
              onToggleSelection={toggleEventSelection}
              sourcesConfig={sourcesConfig}
            />
          )}
        </div>

        {sources.length > 0 && (
          <div className="px-4 md:px-8 py-6 bg-white border-t border-slate-100">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={16} className="text-blue-600" />
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Verified Sources Found by Gemini</h4>
              </div>
              <div className="flex flex-wrap gap-4">
                {sources.map((source, i) => (
                  <a 
                    key={i} 
                    href={source.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-3 py-2 bg-slate-50 hover:bg-blue-50 border border-slate-100 hover:border-blue-100 rounded-xl text-xs font-semibold text-slate-600 hover:text-blue-600 transition-all group"
                  >
                    <img 
                      src={`https://www.google.com/s2/favicons?domain=${new URL(source.uri || '').hostname}&sz=32`} 
                      className="w-4 h-4 rounded-sm grayscale group-hover:grayscale-0 transition-all"
                      alt=""
                    />
                    {source.title || (source.uri && new URL(source.uri).hostname)}
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Bar - Matching Screenshot */}
      {selectedEventIds.size > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 duration-300">
          <div className="bg-slate-900 text-white px-8 py-4 rounded-[2rem] shadow-2xl flex items-center gap-8 border border-white/10 backdrop-blur-md">
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">Selected</span>
              <span className="text-xs font-bold">{selectedEventIds.size} {selectedEventIds.size === 1 ? 'Event' : 'Events'}</span>
            </div>
            
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            >
              <Download size={14} />
              Export .ics
            </button>
            
            <button 
              onClick={() => setSelectedEventIds(new Set())}
              className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 hover:text-white transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <SourceManager 
        isOpen={isSourceModalOpen}
        sources={sourcesConfig}
        onClose={() => setIsSourceModalOpen(false)}
        onUpdate={setSourcesConfig}
      />

      {isLoading && events.length === 0 && (
        <div className="fixed inset-0 z-40 bg-white/60 backdrop-blur-sm flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-600 font-bold animate-pulse uppercase tracking-widest text-xs">Syncing Calendar...</p>
          </div>
        </div>
      )}

      {!isLoading && events.length === 0 && !error && (
        <div className="fixed inset-0 pointer-events-none flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-white border border-slate-100 shadow-2xl rounded-[2.5rem] p-12 text-center pointer-events-auto animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-blue-600">
              <Calendar size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Ready to Synchronize?</h2>
            <p className="text-slate-500 mb-10 leading-relaxed font-medium">Add venue websites in the Sources menu to populate your cultural calendar automatically.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={updateEvents}
                className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all"
              >
                Sync All Active Sources
              </button>
              <button 
                onClick={() => setIsSourceModalOpen(true)}
                className="px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Manage Sources
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
