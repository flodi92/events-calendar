import React from 'react';
import { ChevronLeft, ChevronRight, RefreshCw, Calendar, Columns, Settings2, Download, CloudSync } from 'lucide-react';
import { ViewMode } from '../types.ts';

interface CalendarHeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  currentDate: Date;
  onNavigate: (direction: 'prev' | 'next') => void;
  onRefresh: () => void;
  onOpenSources: () => void;
  onExport: () => void;
  onSyncGoogle: () => void;
  selectedCount: number;
  isLoading: boolean;
  isSyncing: boolean;
  label: string;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  viewMode,
  setViewMode,
  currentDate,
  onNavigate,
  onRefresh,
  onOpenSources,
  onExport,
  onSyncGoogle,
  selectedCount,
  isLoading,
  isSyncing,
  label
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4 md:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
      <div className="flex items-center justify-between md:justify-start gap-8">
        <h1 className="text-xl font-black text-slate-900 tracking-tighter">Cultural<span className="text-blue-600">Calendar</span></h1>
        
        <div className="flex items-center bg-slate-100/80 p-1.5 rounded-2xl">
          <button
            onClick={() => setViewMode('year')}
            className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              viewMode === 'year' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Calendar size={14} className="mr-2" />
            Year
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
              viewMode === 'week' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Columns size={14} className="mr-2" />
            Week
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between lg:justify-end gap-6 flex-1">
        <div className="flex items-center gap-1">
          <button 
            onClick={() => onNavigate('prev')}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-lg font-bold text-slate-900 min-w-[180px] text-center tracking-tight">
            {label}
          </span>
          <button 
            onClick={() => onNavigate('next')}
            className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-900 transition-all active:scale-90"
          >
            <ChevronRight size={24} />
          </button>
        </div>

        {/* Action Group Container */}
        <div className="flex items-center bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          {/* Export Button */}
          <button
            onClick={onExport}
            disabled={selectedCount === 0}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-r border-slate-200 ${
              selectedCount > 0 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <Download size={14} />
            Export {selectedCount > 0 ? `(${selectedCount})` : ''}
          </button>

          {/* Synchronize Button - Positioning it next to Export */}
          <button
            onClick={onSyncGoogle}
            disabled={selectedCount === 0 || isSyncing}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all border-r border-slate-200 ${
              selectedCount > 0 
                ? 'bg-white text-blue-600 hover:bg-blue-50' 
                : 'bg-slate-50 text-slate-300 cursor-not-allowed'
            }`}
          >
            <CloudSync size={14} className={isSyncing ? 'animate-bounce' : ''} />
            {isSyncing ? 'Syncing...' : 'Synchronize'}
          </button>

          {/* Sources Button */}
          <button
            onClick={onOpenSources}
            className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 text-[10px] font-black uppercase tracking-widest transition-all border-r border-slate-200"
          >
            <Settings2 size={14} />
            Sources
          </button>

          {/* Refresh Button - Far Right */}
          <button
            onClick={onRefresh}
            disabled={isLoading}
            className={`flex items-center justify-center gap-2 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${
              isLoading 
                ? 'bg-blue-400 text-white cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            {isLoading ? 'Wait' : 'Refresh'}
          </button>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;