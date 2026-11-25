import React, { useMemo, useState } from 'react';
import { Calendar, ChevronRight, GripVertical, Plus, Search } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { LEAD_STAGES, Lead, LeadStage } from '../types/crm';
import { formatCurrency, formatShortDate } from '../utils/format';

export const LeadsPage: React.FC = () => {
  const {
    leads,
    leadStageFilter,
    setLeadStageFilter,
    moveLeadStage,
    setSelectedLeadId,
    openAddLeadModal,
    settings,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<LeadStage | null>(null);

  const filteredLeads = useMemo(() => {
    const q = search.trim().toLowerCase();
    return leads.filter((l) => {
      const matchesSearch =
        !q ||
        l.name.toLowerCase().includes(q) ||
        l.company.toLowerCase().includes(q) ||
        l.serviceScope.toLowerCase().includes(q) ||
        l.industry.toLowerCase().includes(q);
      const matchesSource = sourceFilter === 'All' || l.source === sourceFilter;
      const matchesStage = leadStageFilter === 'All' || l.stage === leadStageFilter;
      return matchesSearch && matchesSource && matchesStage;
    });
  }, [leads, search, sourceFilter, leadStageFilter]);

  const openDeals = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost');
  const openPipelineVal = openDeals.reduce((sum, l) => sum + l.value, 0);
  const weightedForecast = openDeals.reduce(
    (sum, l) => sum + (l.value * l.probability) / 100,
    0
  );
  const wonCount = leads.filter((l) => l.stage === 'Won').length;
  const closedCount = wonCount + leads.filter((l) => l.stage === 'Lost').length;
  const winRate = closedCount > 0 ? Math.round((wonCount / closedCount) * 100) : 0;

  const visibleStages =
    leadStageFilter === 'All' ? LEAD_STAGES : LEAD_STAGES.filter((s) => s === leadStageFilter);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData('text/plain', leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e: React.DragEvent, stage: LeadStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (id) {
      moveLeadStage(id, stage);
    }
    setDraggedLeadId(null);
    setDragOverStage(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24] font-display">
            Leads Pipeline
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1">
            Move opportunities across stages or select a card to update notes and convert to a client.
          </p>
        </div>
        <button
          type="button"
          onClick={openAddLeadModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Lead
        </button>
      </div>

      {/* Pipeline Summary Bar */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-4 -mr-px -mb-px">
          <div className="p-4 sm:px-5 border-r border-b border-[#ECEAE4]">
            <div className="text-xs text-[#7A808D]">Open pipeline</div>
            <div className="text-lg sm:text-xl font-bold font-display tabular-nums text-[#1A1D24] mt-1">
              {formatCurrency(openPipelineVal, settings.currency)}
            </div>
          </div>
          <div className="p-4 sm:px-5 border-r border-b border-[#ECEAE4]">
            <div className="text-xs text-[#7A808D]">Weighted forecast</div>
            <div className="text-lg sm:text-xl font-bold font-display tabular-nums text-[#1A1D24] mt-1">
              {formatCurrency(Math.round(weightedForecast), settings.currency)}
            </div>
          </div>
          <div className="p-4 sm:px-5 border-r border-b border-[#ECEAE4]">
            <div className="text-xs text-[#7A808D]">Active deals</div>
            <div className="text-lg sm:text-xl font-bold font-display tabular-nums text-[#1A1D24] mt-1">
              {openDeals.length}
            </div>
          </div>
          <div className="p-4 sm:px-5 border-r border-b border-[#ECEAE4]">
            <div className="text-xs text-[#7A808D]">Win rate</div>
            <div className="text-lg sm:text-xl font-bold font-display tabular-nums text-emerald-700 mt-1">
              {winRate}%
            </div>
          </div>
        </div>
      </div>

      {/* Filters & Stage Controls */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC]">
          <button
            type="button"
            onClick={() => setLeadStageFilter('All')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              leadStageFilter === 'All'
                ? 'bg-white text-[#1A1D24] shadow-2xs'
                : 'text-[#525866] hover:text-[#1A1D24]'
            }`}
          >
            All stages
          </button>
          {LEAD_STAGES.map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setLeadStageFilter(st)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                leadStageFilter === st
                  ? 'bg-white text-[#1A1D24] shadow-2xs'
                  : 'text-[#525866] hover:text-[#1A1D24]'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-56">
            <Search className="w-3.5 h-3.5 text-[#7A808D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter leads..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] placeholder:text-[#7A808D] focus:border-[#13233A] focus:outline-none"
            />
          </div>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            aria-label="Filter by lead source"
            className="px-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] focus:border-[#13233A] focus:outline-none cursor-pointer"
          >
            <option value="All">All sources</option>
            <option value="Referral">Referral</option>
            <option value="Inbound Website">Inbound Website</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Partner Agency">Partner Agency</option>
            <option value="Direct Outreach">Direct Outreach</option>
          </select>
        </div>
      </div>

      {filteredLeads.length === 0 && (
        <div className="bg-white border border-[#E5E2DC] rounded-[10px] py-10 px-4 text-center">
          <div className="text-sm font-semibold text-[#1A1D24]">
            No leads match your current filter
          </div>
          <p className="text-xs text-[#7A808D] mt-1">
            Clear your search or stage filter, or add a new opportunity to the pipeline.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSourceFilter('All');
                setLeadStageFilter('All');
              }}
              className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
            >
              Reset filters
            </button>
            <button
              type="button"
              onClick={openAddLeadModal}
              className="px-3.5 py-1.5 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer"
            >
              Add Lead
            </button>
          </div>
        </div>
      )}

      {/* 6-Column Kanban Board */}
      <div className="overflow-x-auto crm-scroll pb-3">
        <div
          className={`grid gap-3.5 ${
            visibleStages.length === 1
              ? 'grid-cols-1 max-w-md'
              : 'grid-flow-col auto-cols-[276px] xl:grid-cols-6 xl:auto-cols-auto'
          }`}
        >
          {visibleStages.map((stage) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stage);
            const stageSum = stageLeads.reduce((s, l) => s + l.value, 0);
            const isOver = dragOverStage === stage;

            return (
              <div
                key={stage}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverStage(stage);
                }}
                onDragLeave={() => setDragOverStage(null)}
                onDrop={(e) => handleDrop(e, stage)}
                className={`rounded-[10px] border transition-colors flex flex-col min-h-[440px] ${
                  isOver
                    ? 'bg-[#EFECE5] border-[#13233A]'
                    : 'bg-[#F3F1EC]/70 border-[#E5E2DC]'
                }`}
              >
                {/* Column Header */}
                <div className="px-3.5 py-3 border-b border-[#E5E2DC] bg-white rounded-t-[9px]">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[13px] font-semibold truncate font-display ${
                        stage === 'Negotiation'
                          ? 'text-[#B4690E]'
                          : stage === 'Won'
                          ? 'text-emerald-700'
                          : 'text-[#1A1D24]'
                      }`}
                    >
                      {stage}
                    </span>
                    <span className="text-xs tabular-nums text-[#7A808D]">
                      {stageLeads.length}
                    </span>
                  </div>
                  <div className="text-xs tabular-nums font-medium text-[#525866] mt-0.5">
                    {formatCurrency(stageSum, settings.currency)}
                  </div>
                </div>

                {/* Cards Stack */}
                <div className="p-2.5 space-y-2.5 flex-1">
                  {stageLeads.map((lead: Lead) => {
                    const nextStageIdx = LEAD_STAGES.indexOf(lead.stage) + 1;
                    const nextStage =
                      nextStageIdx < LEAD_STAGES.length - 1
                        ? LEAD_STAGES[nextStageIdx]
                        : null;

                    return (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        onClick={() => setSelectedLeadId(lead.id)}
                        className="bg-white border border-[#E5E2DC] rounded-lg p-3.5 hover:border-[#BDB6AA] hover:shadow-2xs transition-all duration-150 cursor-pointer group"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[#1A1D24] truncate group-hover:text-[#13233A]">
                              {lead.company}
                            </div>
                            <div className="text-xs text-[#525866] truncate mt-0.5">
                              {lead.name} · {lead.role}
                            </div>
                          </div>
                          <GripVertical
                            className="w-3.5 h-3.5 text-[#D5D0C6] group-hover:text-[#7A808D] shrink-0 mt-0.5 transition-colors"
                            aria-hidden="true"
                          />
                        </div>

                        <div className="mt-2 text-xs text-[#525866] line-clamp-2 leading-relaxed">
                          {lead.serviceScope}
                        </div>

                        <div className="mt-3 pt-2.5 border-t border-[#ECEAE4] flex items-center justify-between gap-2">
                          <span className="text-[13px] font-semibold tabular-nums text-[#1A1D24]">
                            {formatCurrency(lead.value, settings.currency)}
                          </span>
                          <span className="text-[11px] text-[#7A808D]">
                            {lead.source}
                          </span>
                        </div>

                        <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#7A808D]">
                          <span className="inline-flex items-center gap-1 tabular-nums">
                            <Calendar className="w-3 h-3 text-[#B4690E]" aria-hidden="true" />
                            {lead.nextFollowUpDate
                              ? formatShortDate(lead.nextFollowUpDate)
                              : 'Closed'}
                          </span>

                          {nextStage && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveLeadStage(lead.id, nextStage);
                              }}
                              title={`Move to ${nextStage}`}
                              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[#13233A] opacity-80 group-hover:opacity-100 hover:underline cursor-pointer"
                            >
                              <span>Advance</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {stageLeads.length === 0 && (
                    <div className="h-28 flex flex-col items-center justify-center text-center px-3 border border-dashed border-[#DFDBD2] rounded-lg">
                      <span className="text-xs text-[#7A808D]">No deals in {stage}</span>
                      <button
                        type="button"
                        onClick={openAddLeadModal}
                        className="mt-1.5 text-[11px] font-medium text-[#13233A] hover:underline cursor-pointer"
                      >
                        + Add lead
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
