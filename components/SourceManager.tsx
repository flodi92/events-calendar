
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Globe, Check, AlertCircle } from 'lucide-react';
import { SourceConfig } from '../types.ts';

interface SourceManagerProps {
  sources: SourceConfig[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (sources: SourceConfig[]) => void;
}

const SourceManager: React.FC<SourceManagerProps> = ({ sources, isOpen, onClose, onUpdate }) => {
  const [newUrl, setNewUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    if (!newUrl) return;
    
    if (!validateUrl(newUrl)) {
      setError('Please enter a valid URL (e.g., https://example.com)');
      return;
    }

    const isDuplicate = sources.some(s => s.url.toLowerCase() === newUrl.toLowerCase());
    if (isDuplicate) {
      setError('This source is already in your list');
      return;
    }

    const newSource: SourceConfig = {
      id: Math.random().toString(36).substr(2, 9),
      url: newUrl,
      active: true
    };
    
    onUpdate([...sources, newSource]);
    setNewUrl('');
    setError(null);
  };

  const handleToggle = (id: string) => {
    onUpdate(sources.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  const handleDelete = (id: string) => {
    onUpdate(sources.filter(s => s.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      <div className="relative bg-white w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Event Sources</h2>
            <p className="text-sm text-slate-500 mt-0.5">Manage websites Gemini uses to find events</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* List */}
        <div className="p-8 max-h-[50vh] overflow-y-auto custom-scrollbar bg-slate-50/50">
          {sources.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
                <Globe size={32} />
              </div>
              <p className="text-slate-500 font-medium">No sources configured yet</p>
              <p className="text-slate-400 text-sm mt-1">Add a venue URL below to start syncing</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sources.map((source) => {
                const hostname = new URL(source.url).hostname;
                return (
                  <div 
                    key={source.id} 
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 group ${
                      source.active 
                        ? 'bg-white border-slate-200 shadow-sm' 
                        : 'bg-slate-100/50 border-transparent opacity-60'
                    }`}
                  >
                    <div className="relative flex items-center justify-center shrink-0">
                      <input
                        type="checkbox"
                        checked={source.active}
                        onChange={() => handleToggle(source.id)}
                        className="peer h-6 w-6 cursor-pointer appearance-none rounded-lg border-2 border-slate-300 bg-white checked:border-blue-600 checked:bg-blue-600 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                      <Check className="pointer-events-none absolute h-4 w-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <img 
                          src={`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`} 
                          alt="" 
                          className="w-4 h-4 rounded-sm"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">
                          {hostname}
                        </span>
                      </div>
                      <div className="text-sm font-semibold text-slate-900 truncate">
                        {source.url}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDelete(source.id)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove source"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add Section */}
        <div className="p-8 border-t border-slate-100 bg-white">
          <div className="flex flex-col gap-3">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={newUrl}
                  onChange={(e) => {
                    setNewUrl(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="https://venue-website.com/events"
                  className={`w-full pl-4 pr-10 py-3 rounded-xl border transition-all focus:outline-none focus:ring-4 text-sm ${
                    error 
                      ? 'border-red-200 focus:ring-red-500/10 focus:border-red-500' 
                      : 'border-slate-200 focus:ring-blue-500/10 focus:border-blue-500'
                  }`}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                {newUrl && !error && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300">
                    <Globe size={18} />
                  </div>
                )}
              </div>
              <button
                onClick={handleAdd}
                disabled={!newUrl}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 text-white px-5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2 h-[46px]"
              >
                <Plus size={20} />
                <span>Add</span>
              </button>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-xs font-semibold animate-in slide-in-from-top-1 duration-200">
                <AlertCircle size={14} />
                {error}
              </div>
            )}
            <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest flex items-center gap-2">
              <Globe size={12} />
              The AI will automatically parse event data from any valid URL
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SourceManager;
