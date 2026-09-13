'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, User, CheckSquare, Layers, Briefcase, FileText, X, ArrowRight } from 'lucide-react';
import { Dialog } from '@/components/ui/dialog';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'clients' | 'staff' | 'tasks' | 'workflows' | 'projects'>('all');
  const [results, setResults] = useState<{
    clients: any[];
    staff: any[];
    tasks: any[];
    workflows: any[];
    projects: any[];
  }>({
    clients: [],
    staff: [],
    tasks: [],
    workflows: [],
    projects: [],
  });
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults({ clients: [], staff: [], tasks: [], workflows: [], projects: [] });
      setTotal(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ clients: [], staff: [], tasks: [], workflows: [], projects: [] });
      setTotal(0);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((data) => {
          if (data.results) {
            setResults(data.results);
            setTotal(data.total || 0);
          }
        })
        .catch((e) => console.error('Search error', e))
        .finally(() => setLoading(false));
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleNavigate = (link: string) => {
    onClose();
    router.push(link);
  };

  const getFilteredItems = () => {
    const list: any[] = [];
    if (activeTab === 'all' || activeTab === 'clients') {
      results.clients.forEach((c) => list.push({ ...c, category: 'Client' }));
    }
    if (activeTab === 'all' || activeTab === 'staff') {
      results.staff.forEach((s) => list.push({ ...s, category: 'Staff Member' }));
    }
    if (activeTab === 'all' || activeTab === 'tasks') {
      results.tasks.forEach((t) => list.push({ ...t, category: 'Task' }));
    }
    if (activeTab === 'all' || activeTab === 'workflows') {
      results.workflows.forEach((w) => list.push({ ...w, category: 'Workflow' }));
    }
    if (activeTab === 'all' || activeTab === 'projects') {
      results.projects.forEach((p) => list.push({ ...p, category: 'Project' }));
    }
    return list;
  };

  const filteredItems = getFilteredItems();

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="DBA Search Agent" description="Instant cross-database index: Clients, Staff, Tasks, Workflows & Projects" maxWidth="xl">
      <div className="space-y-3 pt-1">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-emerald-600 absolute left-3.5 pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type anything to search... (e.g., Acme, Sarah, Backlinks, Stage 3)"
            className="w-full bg-zinc-50 focus:bg-white text-sm text-zinc-900 placeholder-zinc-400 pl-10 pr-9 py-2.5 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-xs"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 text-zinc-400 hover:text-zinc-600 p-0.5">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-zinc-100">
          {[
            { id: 'all', label: 'All Results', count: total },
            { id: 'clients', label: 'Clients', count: results.clients.length },
            { id: 'staff', label: 'Staff', count: results.staff.length },
            { id: 'tasks', label: 'Tasks', count: results.tasks.length },
            { id: 'workflows', label: 'Workflows', count: results.workflows.length },
            { id: 'projects', label: 'Projects', count: results.projects.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-medium transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-emerald-100 text-emerald-900 font-semibold'
                  : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800'
              }`}
            >
              {tab.label} {query && <span className="opacity-70">({tab.count})</span>}
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
          {loading ? (
            <div className="py-8 text-center text-xs text-zinc-400">Searching records...</div>
          ) : filteredItems.length > 0 ? (
            filteredItems.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleNavigate(item.link)}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-zinc-100 group-hover:bg-emerald-100 text-zinc-600 group-hover:text-emerald-800 flex items-center justify-center shrink-0">
                    {item.type === 'client' && <Briefcase className="w-4 h-4" />}
                    {item.type === 'staff' && <User className="w-4 h-4" />}
                    {item.type === 'task' && <CheckSquare className="w-4 h-4" />}
                    {item.type === 'workflow' && <Layers className="w-4 h-4" />}
                    {item.type === 'project' && <FileText className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-zinc-900 truncate">{item.title}</p>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 font-medium">
                        {item.category}
                      </span>
                    </div>
                    {item.subtitle && (
                      <p className="text-[11px] text-zinc-500 truncate">{item.subtitle}</p>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
              </div>
            ))
          ) : query ? (
            <div className="py-8 text-center text-xs text-zinc-500">
              No matching records found for "{query}". Try checking another tab.
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
              <p className="font-medium text-zinc-600">DBA Search Agent is ready.</p>
              <p>Type keywords to search clients, team members, deliverables, and pipelines.</p>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
