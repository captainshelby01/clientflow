import React, { useMemo, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Plus, Search, X } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { Project } from '../types/crm';
import { formatCurrency, formatDisplayDate, getTodayISO, addDaysISO } from '../utils/format';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    clients,
    settings,
    navigateTo,
    addProject,
    updateProjectStatus,
    toggleMilestone,
  } = useCRM();

  const [statusFilter, setStatusFilter] = useState<'All' | Project['status']>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(projects[0]?.id ?? null);
  const [showNewModal, setShowNewModal] = useState(false);

  const [title, setTitle] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id ?? '');
  const [budget, setBudget] = useState('15000');
  const [dueDate, setDueDate] = useState(() => addDaysISO(45));
  const [phase, setPhase] = useState('Discovery & Strategy');
  const [summary, setSummary] = useState('');

  const filteredProjects = useMemo(() => {
    const q = search.trim().toLowerCase();
    return projects.filter((p) => {
      const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchesSearch =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.company.toLowerCase().includes(q) ||
        p.clientName.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [projects, statusFilter, search]);

  const activeBudget = projects
    .filter((p) => p.status !== 'Completed')
    .reduce((s, p) => s + p.budget, 0);
  const activeBilled = projects
    .filter((p) => p.status !== 'Completed')
    .reduce((s, p) => s + p.billed, 0);

  const statusTone: Record<Project['status'], string> = {
    Planning: 'text-[#525866]',
    'In Progress': 'text-[#13233A]',
    Review: 'text-[#B4690E]',
    Completed: 'text-emerald-700',
  };

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId) || clients[0];
    if (!title.trim() || !client) return;

    addProject({
      title: title.trim(),
      clientId: client.id,
      clientName: client.name,
      company: client.company,
      status: 'Planning',
      phase: phase.trim() || 'Discovery',
      budget: Math.max(0, Number(budget) || 0),
      billed: 0,
      startDate: getTodayISO(),
      dueDate,
      progress: 0,
      summary: summary.trim() || `Client engagement for ${client.company}.`,
      deliverables: ['Scope Kickoff', 'Core Deliverable'],
    });
    setTitle('');
    setSummary('');
    setShowNewModal(false);
  };

  const hasFilters = statusFilter !== 'All' || search.trim() !== '';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24] font-display">
            Projects
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1">
            Active scope budget:{' '}
            <span className="tabular-nums font-medium text-[#1A1D24]">
              {formatCurrency(activeBudget, settings.currency)}
            </span>{' '}
            · Billed to date:{' '}
            <span className="tabular-nums font-medium text-[#1A1D24]">
              {formatCurrency(activeBilled, settings.currency)}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowNewModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC]">
          {(['All', 'Planning', 'In Progress', 'Review', 'Completed'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === st
                  ? 'bg-white text-[#1A1D24] shadow-2xs'
                  : 'text-[#525866] hover:text-[#1A1D24]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#7A808D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects or clients..."
            className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] placeholder:text-[#7A808D] focus:border-[#13233A] focus:outline-none"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-3">
        {filteredProjects.map((project) => {
          const isExpanded = expandedId === project.id;
          return (
            <div
              key={project.id}
              className="bg-white border border-[#E5E2DC] rounded-[10px] overflow-hidden"
            >
              <div className="p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
                      {project.title}
                    </h2>
                    <span className="text-xs text-[#7A808D]">·</span>
                    <button
                      type="button"
                      onClick={() => navigateTo('clients', { clientId: project.clientId })}
                      className="text-xs font-medium text-[#13233A] hover:underline cursor-pointer"
                    >
                      {project.company}
                    </button>
                  </div>
                  <p className="text-xs text-[#525866] mt-1 line-clamp-1">
                    {project.summary}
                  </p>
                  <div className="text-[11.5px] text-[#7A808D] mt-2 flex flex-wrap items-center gap-2 tabular-nums">
                    <span>Phase: {project.phase}</span>
                    <span>·</span>
                    <span>Due {formatDisplayDate(project.dueDate)}</span>
                    <span>·</span>
                    <span>
                      {formatCurrency(project.billed, settings.currency)} /{' '}
                      {formatCurrency(project.budget, settings.currency)} billed
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <div className="w-32">
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="text-[#7A808D]">Progress</span>
                      <span className="tabular-nums font-medium text-[#1A1D24]">
                        {project.progress}%
                      </span>
                    </div>
                    <div className="h-1.5 bg-[#F3F1EC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#13233A] rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <select
                    value={project.status}
                    onChange={(e) =>
                      updateProjectStatus(project.id, e.target.value as Project['status'])
                    }
                    aria-label={`Status for ${project.title}`}
                    className={`px-3 py-1.5 text-xs font-semibold bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg cursor-pointer focus:border-[#13233A] focus:outline-none ${statusTone[project.status]}`}
                  >
                    <option value="Planning">Planning</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Review">Review</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : project.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-[#525866] hover:text-[#1A1D24] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
                  >
                    <span>Milestones</span>
                    {isExpanded ? (
                      <ChevronUp className="w-3.5 h-3.5" />
                    ) : (
                      <ChevronDown className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="px-5 sm:px-6 pb-5 pt-4 border-t border-[#ECEAE4] bg-[#FAF9F6] grid grid-cols-1 md:grid-cols-12 gap-5">
                  <div className="md:col-span-8">
                    <div className="text-xs font-semibold text-[#1A1D24] mb-2.5">
                      Project milestones (click to toggle completion)
                    </div>
                    <div className="space-y-2">
                      {project.milestones.map((ms) => (
                        <button
                          key={ms.id}
                          type="button"
                          onClick={() => toggleMilestone(project.id, ms.id)}
                          className="w-full flex items-center justify-between gap-3 px-3.5 py-2.5 bg-white border border-[#E5E2DC] rounded-lg hover:border-[#CFCAC0] text-left cursor-pointer"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                                ms.completed
                                  ? 'bg-[#13233A] border-[#13233A] text-white'
                                  : 'bg-white border-[#CFCAC0]'
                              }`}
                            >
                              {ms.completed && <Check className="w-3 h-3" />}
                            </span>
                            <span
                              className={`text-xs truncate ${
                                ms.completed
                                  ? 'line-through text-[#7A808D]'
                                  : 'text-[#1A1D24] font-medium'
                              }`}
                            >
                              {ms.title}
                            </span>
                          </div>
                          <span className="text-[11px] tabular-nums text-[#7A808D] shrink-0">
                            {formatDisplayDate(ms.dueDate)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="md:col-span-4 space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-[#1A1D24] mb-1.5">
                        Key deliverables
                      </div>
                      <ul className="space-y-1 text-xs text-[#525866]">
                        {project.deliverables.map((del) => (
                          <li key={del}>· {del}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="pt-2 border-t border-[#ECEAE4] text-xs">
                      <span className="text-[#7A808D]">Client lead: </span>
                      <button
                        type="button"
                        onClick={() => navigateTo('clients', { clientId: project.clientId })}
                        className="font-medium text-[#13233A] hover:underline cursor-pointer"
                      >
                        {project.clientName}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredProjects.length === 0 && (
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] py-14 px-4 text-center">
            <div className="text-sm font-semibold text-[#1A1D24]">
              No projects match this filter
            </div>
            <p className="text-xs text-[#7A808D] mt-1">
              Reset your filter or start a new client project.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2.5">
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('All');
                    setSearch('');
                  }}
                  className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] rounded-md cursor-pointer"
                >
                  Clear filters
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowNewModal(true)}
                className="px-3.5 py-1.5 text-xs font-medium bg-[#13233A] text-white rounded-md cursor-pointer"
              >
                New Project
              </button>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowNewModal(false);
          }}
        >
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4]">
              <h2 className="text-base font-semibold text-[#1A1D24] font-display">
                New Project
              </h2>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#525866] mb-1">
                  Project title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Q1 Brand Refresh & Design System"
                  className="w-full px-3 py-2 text-sm border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#525866] mb-1">
                  Client
                </label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company} ({c.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#525866] mb-1">
                    Budget (USD)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-3 py-2 text-sm tabular-nums border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#525866] mb-1">
                    Target due date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 text-sm tabular-nums border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#525866] mb-1">
                  Initial phase
                </label>
                <input
                  type="text"
                  value={phase}
                  onChange={(e) => setPhase(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#525866] mb-1">
                  Summary
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Scope overview and key objectives..."
                  className="w-full px-3 py-2 text-sm border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-[#ECEAE4]">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#525866] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-[#13233A] rounded-lg hover:bg-[#1D3454] cursor-pointer"
                >
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
