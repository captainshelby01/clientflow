import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronRight, Plus, Search } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ClientStatus } from '../types/crm';
import { formatCurrency, formatDisplayDate, getInitials } from '../utils/format';

type SortField = 'name' | 'company' | 'totalValue' | 'lastContactDate';

export const ClientsPage: React.FC = () => {
  const {
    clients,
    projects,
    navigateTo,
    openAddClientModal,
    settings,
  } = useCRM();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | ClientStatus>('All');
  const [industryFilter, setIndustryFilter] = useState<string>('All');
  const [sortField, setSortField] = useState<SortField>('totalValue');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const industries = useMemo(() => {
    const set = new Set(clients.map((c) => c.industry));
    return ['All', ...Array.from(set).sort()];
  }, [clients]);

  const getActiveProjectForClient = (clientId: string) => {
    const active = projects.find((p) => p.clientId === clientId && p.status !== 'Completed');
    if (active) return active.title;
    const completed = projects.find((p) => p.clientId === clientId);
    return completed ? `${completed.title} (Completed)` : 'No active project';
  };

  const filteredClients = useMemo(() => {
    const q = search.trim().toLowerCase();
    return clients
      .filter((c) => {
        const activeProj = getActiveProjectForClient(c.id).toLowerCase();
        const matchesSearch =
          !q ||
          c.name.toLowerCase().includes(q) ||
          c.company.toLowerCase().includes(q) ||
          c.industry.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          activeProj.includes(q);
        const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
        const matchesIndustry = industryFilter === 'All' || c.industry === industryFilter;
        return matchesSearch && matchesStatus && matchesIndustry;
      })
      .sort((a, b) => {
        let cmp = 0;
        if (sortField === 'totalValue') {
          cmp = a.totalValue - b.totalValue;
        } else if (sortField === 'lastContactDate') {
          cmp = a.lastContactDate.localeCompare(b.lastContactDate);
        } else {
          cmp = a[sortField].localeCompare(b[sortField]);
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
  }, [clients, projects, search, statusFilter, industryFilter, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir(field === 'totalValue' || field === 'lastContactDate' ? 'desc' : 'asc');
    }
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-[#A8A298]" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-[#13233A]" />
    ) : (
      <ArrowDown className="w-3 h-3 text-[#13233A]" />
    );
  };

  const statusTextClass: Record<ClientStatus, string> = {
    Active: 'text-emerald-700',
    Retainer: 'text-[#13233A]',
    Onboarding: 'text-[#B4690E]',
    Past: 'text-[#7A808D]',
  };

  const totalBookValue = filteredClients.reduce((s, c) => s + c.totalValue, 0);
  const hasFilters = search.trim() !== '' || statusFilter !== 'All' || industryFilter !== 'All';

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('All');
    setIndustryFilter('All');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24] font-display">
            Clients
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1">
            {filteredClients.length} {filteredClients.length === 1 ? 'account' : 'accounts'} ·{' '}
            <span className="tabular-nums text-[#1A1D24] font-medium">
              {formatCurrency(totalBookValue, settings.currency)}
            </span>{' '}
            combined client value
          </p>
        </div>
        <button
          type="button"
          onClick={openAddClientModal}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] transition-colors cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Client
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC]">
          {(['All', 'Active', 'Retainer', 'Onboarding', 'Past'] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                statusFilter === status
                  ? 'bg-white text-[#1A1D24] shadow-2xs'
                  : 'text-[#525866] hover:text-[#1A1D24]'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#7A808D] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search client, company, project..."
              className="w-full pl-8.5 pr-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] placeholder:text-[#7A808D] focus:border-[#13233A] focus:outline-none"
            />
          </div>

          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            aria-label="Filter by industry"
            className="px-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] focus:border-[#13233A] focus:outline-none cursor-pointer"
          >
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind === 'All' ? 'All industries' : ind}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white border border-[#E5E2DC] rounded-[10px] overflow-hidden">
        <div className="overflow-x-auto crm-scroll">
          <table className="w-full text-left border-collapse min-w-[820px]">
            <thead>
              <tr className="border-b border-[#E5E2DC] bg-[#FAF9F6] text-[12px] font-semibold text-[#525866]">
                <th className="py-3.5 px-5">
                  <button
                    type="button"
                    onClick={() => handleSort('name')}
                    className="inline-flex items-center gap-1.5 hover:text-[#1A1D24] cursor-pointer"
                  >
                    <span>Client name</span>
                    {renderSortIcon('name')}
                  </button>
                </th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('company')}
                    className="inline-flex items-center gap-1.5 hover:text-[#1A1D24] cursor-pointer"
                  >
                    <span>Company</span>
                    {renderSortIcon('company')}
                  </button>
                </th>
                <th className="py-3.5 px-4">Industry</th>
                <th className="py-3.5 px-4">Active project</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">
                  <button
                    type="button"
                    onClick={() => handleSort('lastContactDate')}
                    className="inline-flex items-center gap-1.5 hover:text-[#1A1D24] cursor-pointer"
                  >
                    <span>Last contact</span>
                    {renderSortIcon('lastContactDate')}
                  </button>
                </th>
                <th className="py-3.5 px-5 text-right">
                  <button
                    type="button"
                    onClick={() => handleSort('totalValue')}
                    className="inline-flex items-center gap-1.5 hover:text-[#1A1D24] cursor-pointer ml-auto"
                  >
                    <span>Total value</span>
                    {renderSortIcon('totalValue')}
                  </button>
                </th>
                <th className="py-3.5 px-3 w-8" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEAE4] text-[13px]">
              {filteredClients.map((client) => {
                const activeProjectTitle = getActiveProjectForClient(client.id);
                return (
                  <tr
                    key={client.id}
                    onClick={() => navigateTo('clients', { clientId: client.id })}
                    className="hover:bg-[#FAF9F6] transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#F3F1EC] border border-[#E5E2DC] flex items-center justify-center text-[11px] font-semibold text-[#13233A] shrink-0">
                          {getInitials(client.name)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#1A1D24] group-hover:text-[#13233A] truncate">
                            {client.name}
                          </div>
                          <div className="text-[11.5px] text-[#7A808D] truncate">
                            {client.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1A1D24]">
                      {client.company}
                    </td>
                    <td className="py-3.5 px-4 text-[#525866]">{client.industry}</td>
                    <td className="py-3.5 px-4 text-[#525866] max-w-[240px] truncate">
                      {activeProjectTitle}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`font-medium text-xs ${statusTextClass[client.status]}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs tabular-nums text-[#525866]">
                      {formatDisplayDate(client.lastContactDate)}
                    </td>
                    <td className="py-3.5 px-5 text-right tabular-nums font-semibold text-[#1A1D24]">
                      {formatCurrency(client.totalValue, settings.currency)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-[#CFCAC0] group-hover:text-[#13233A] inline-block transition-colors" />
                    </td>
                  </tr>
                );
              })}

              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-14 text-center px-4">
                    <div className="text-sm font-semibold text-[#1A1D24]">
                      No clients match your current filter
                    </div>
                    <p className="text-xs text-[#7A808D] mt-1">
                      Adjust your search query or add a new client account.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2.5">
                      {hasFilters && (
                        <button
                          type="button"
                          onClick={resetFilters}
                          className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                        >
                          Clear filters
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={openAddClientModal}
                        className="px-3.5 py-1.5 text-xs font-medium bg-[#13233A] text-white rounded-md hover:bg-[#1D3454] cursor-pointer"
                      >
                        Add Client
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Responsive Mobile Client List */}
      <div className="md:hidden space-y-2.5">
        {filteredClients.map((client) => {
          const activeProjectTitle = getActiveProjectForClient(client.id);
          return (
            <button
              key={client.id}
              type="button"
              onClick={() => navigateTo('clients', { clientId: client.id })}
              className="w-full text-left bg-white border border-[#E5E2DC] rounded-[10px] p-4 hover:border-[#CFCAC0] transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[#F3F1EC] border border-[#E5E2DC] flex items-center justify-center text-xs font-semibold text-[#13233A] shrink-0">
                    {getInitials(client.name)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-[#1A1D24] truncate">
                      {client.name}
                    </div>
                    <div className="text-xs text-[#525866] truncate">
                      {client.company} · {client.industry}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-sm font-semibold tabular-nums text-[#1A1D24]">
                    {formatCurrency(client.totalValue, settings.currency)}
                  </div>
                  <div className={`text-[11px] font-medium ${statusTextClass[client.status]}`}>
                    {client.status}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2.5 border-t border-[#ECEAE4] flex items-center justify-between gap-2 text-xs text-[#7A808D]">
                <span className="truncate">{activeProjectTitle}</span>
                <span className="tabular-nums shrink-0">
                  {formatDisplayDate(client.lastContactDate)}
                </span>
              </div>
            </button>
          );
        })}

        {filteredClients.length === 0 && (
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] py-12 px-4 text-center">
            <div className="text-sm font-semibold text-[#1A1D24]">No matching clients</div>
            <p className="text-xs text-[#7A808D] mt-1">
              Clear your filters or add a new client account.
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-3 px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] rounded-md cursor-pointer"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
