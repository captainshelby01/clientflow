import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { downloadCSV, formatCurrency } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const { clients, leads, monthlyRevenue, settings, navigateTo, showToast } = useCRM();
  const [period, setPeriod] = useState<'6m' | '12m'>('6m');
  const [hoveredMonthIdx, setHoveredMonthIdx] = useState<number | null>(null);

  const visibleMonths = period === '6m' ? monthlyRevenue.slice(-6) : monthlyRevenue;
  const totalPeriodRevenue = visibleMonths.reduce((s, m) => s + m.revenue, 0);
  const totalPeriodTarget = visibleMonths.reduce((s, m) => s + m.target, 0);
  const targetAttainment =
    totalPeriodTarget > 0 ? Math.round((totalPeriodRevenue / totalPeriodTarget) * 100) : 0;

  const wonLeads = leads.filter((l) => l.stage === 'Won');
  const lostLeads = leads.filter((l) => l.stage === 'Lost');
  const winRate =
    wonLeads.length + lostLeads.length > 0
      ? Math.round((wonLeads.length / (wonLeads.length + lostLeads.length)) * 100)
      : 0;

  const avgDealSize =
    leads.length > 0
      ? Math.round(leads.reduce((s, l) => s + l.value, 0) / leads.length)
      : 0;

  const retainerClients = clients.filter((c) => c.status === 'Retainer');
  const monthlyRecurring = retainerClients.reduce(
    (s, c) => s + (c.monthlyRetainer || 0),
    0
  );

  // Revenue by Industry
  const industryTotals = Object.entries(
    clients.reduce<Record<string, { total: number; count: number }>>((acc, c) => {
      if (!acc[c.industry]) acc[c.industry] = { total: 0, count: 0 };
      acc[c.industry].total += c.totalValue;
      acc[c.industry].count += 1;
      return acc;
    }, {})
  )
    .map(([industry, info]) => ({ industry, ...info }))
    .sort((a, b) => b.total - a.total);

  const maxIndustryVal = Math.max(...industryTotals.map((i) => i.total), 1);

  // Lead Source Performance
  const sourceStats = Object.entries(
    leads.reduce<Record<string, { count: number; value: number; won: number }>>((acc, l) => {
      if (!acc[l.source]) acc[l.source] = { count: 0, value: 0, won: 0 };
      acc[l.source].count += 1;
      acc[l.source].value += l.value;
      if (l.stage === 'Won') acc[l.source].won += 1;
      return acc;
    }, {})
  )
    .map(([source, info]) => ({ source, ...info }))
    .sort((a, b) => b.value - a.value);

  // SVG Grouped Bar Chart calculations
  const maxBarRaw = Math.max(...visibleMonths.map((m) => Math.max(m.revenue, m.target)), 1000);
  const stepUnit = maxBarRaw > 20000 ? 10000 : 5000;
  const yMax = Math.ceil((maxBarRaw * 1.15) / stepUnit) * stepUnit;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(yMax * t));

  const svgW = 860;
  const svgH = 240;
  const padL = 58;
  const padR = 16;
  const padT = 18;
  const padB = 32;
  const plotW = svgW - padL - padR;
  const plotH = svgH - padT - padB;
  const groupW = plotW / visibleMonths.length;
  const barW = Math.min(20, groupW * 0.28);

  const getY = (val: number) => padT + plotH - (val / yMax) * plotH;

  const handleExportCSV = () => {
    const headers = ['Month', 'Collected Revenue (USD)', 'Target (USD)', 'Invoices Paid'];
    const rows = visibleMonths.map((m) => [m.fullMonth, m.revenue, m.target, m.invoicesCount]);
    downloadCSV(`clientflow-revenue-report-${period}.csv`, headers, rows);
    showToast('Exported CSV revenue report');
  };

  const hoveredMonth = hoveredMonthIdx !== null ? visibleMonths[hoveredMonthIdx] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24] font-display">
            Reports & Revenue Analytics
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1">
            Monitor consulting revenue attainment, pipeline conversion, and top client accounts.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC]">
            <button
              type="button"
              onClick={() => setPeriod('6m')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                period === '6m' ? 'bg-white text-[#1A1D24] shadow-2xs' : 'text-[#525866]'
              }`}
            >
              6 months
            </button>
            <button
              type="button"
              onClick={() => setPeriod('12m')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                period === '12m' ? 'bg-white text-[#1A1D24] shadow-2xs' : 'text-[#525866]'
              }`}
            >
              12 months
            </button>
          </div>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Top Metrics Strip */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[#ECEAE4]">
        <div className="p-5">
          <div className="text-xs text-[#525866]">Period collected revenue</div>
          <div className="text-2xl font-bold font-display tabular-nums text-[#1A1D24] mt-1.5">
            {formatCurrency(totalPeriodRevenue, settings.currency)}
          </div>
          <div className="text-[11.5px] text-emerald-700 mt-1 tabular-nums">
            {targetAttainment}% of {formatCurrency(totalPeriodTarget, settings.currency)} target
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#525866]">Pipeline win rate</div>
          <div className="text-2xl font-bold font-display tabular-nums text-[#1A1D24] mt-1.5">
            {winRate}%
          </div>
          <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums">
            {wonLeads.length} won · {lostLeads.length} lost closed deals
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#525866]">Average deal size</div>
          <div className="text-2xl font-bold font-display tabular-nums text-[#1A1D24] mt-1.5">
            {formatCurrency(avgDealSize, settings.currency)}
          </div>
          <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums">
            Across {leads.length} pipeline deals
          </div>
        </div>

        <div className="p-5">
          <div className="text-xs text-[#525866]">Monthly retainer base</div>
          <div className="text-2xl font-bold font-display tabular-nums text-[#1A1D24] mt-1.5">
            {formatCurrency(monthlyRecurring, settings.currency)}
          </div>
          <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums">
            {retainerClients.length} active retainer accounts
          </div>
        </div>
      </div>

      {/* SVG Revenue vs Target Chart */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
              Collected revenue vs. monthly target
            </h2>
            <p className="text-xs text-[#7A808D] mt-0.5">
              Hover any month to inspect invoice volume and target variance
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs text-[#525866]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#13233A] inline-block" />
              Collected
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#DFDBD2] inline-block" />
              Target
            </span>
          </div>
        </div>

        <div className="relative w-full">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto overflow-visible select-none"
            role="img"
            aria-label="Collected revenue vs monthly target bar chart"
          >
            {yTicks.map((tick) => {
              const y = getY(tick);
              return (
                <g key={tick}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={svgW - padR}
                    y2={y}
                    stroke="#EFECE6"
                    strokeWidth="1"
                  />
                  <text
                    x={padL - 10}
                    y={y + 3.5}
                    textAnchor="end"
                    className="fill-[#7A808D] text-[10.5px] font-sans tabular-nums"
                  >
                    {formatCurrency(tick, settings.currency, true)}
                  </text>
                </g>
              );
            })}

            {visibleMonths.map((m, idx) => {
              const centerX = padL + idx * groupW + groupW / 2;
              const revY = getY(m.revenue);
              const revH = padT + plotH - revY;
              const tgtY = getY(m.target);
              const tgtH = padT + plotH - tgtY;
              const isHovered = hoveredMonthIdx === idx;

              return (
                <g key={m.month}>
                  {isHovered && (
                    <rect
                      x={padL + idx * groupW + 4}
                      y={padT}
                      width={groupW - 8}
                      height={plotH}
                      rx={4}
                      fill="#FAF9F6"
                    />
                  )}
                  <rect
                    x={centerX - barW - 2}
                    y={revY}
                    width={barW}
                    height={revH}
                    rx={2.5}
                    fill={isHovered ? '#B4690E' : '#13233A'}
                  />
                  <rect
                    x={centerX + 2}
                    y={tgtY}
                    width={barW * 0.85}
                    height={tgtH}
                    rx={2.5}
                    fill="#DFDBD2"
                  />
                  <text
                    x={centerX}
                    y={svgH - 8}
                    textAnchor="middle"
                    className={`text-[11px] font-sans ${
                      isHovered ? 'fill-[#1A1D24] font-semibold' : 'fill-[#7A808D]'
                    }`}
                  >
                    {m.month}
                  </text>
                  <rect
                    x={padL + idx * groupW}
                    y={padT}
                    width={groupW}
                    height={plotH + padB}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredMonthIdx(idx)}
                    onMouseLeave={() => setHoveredMonthIdx(null)}
                  />
                </g>
              );
            })}
          </svg>

          {hoveredMonth && hoveredMonthIdx !== null && (
            <div
              className="pointer-events-none absolute top-0 bg-[#13233A] text-white px-3.5 py-2.5 rounded-lg shadow-md text-xs z-10 min-w-[172px]"
              style={
                hoveredMonthIdx >= Math.floor(visibleMonths.length / 2)
                  ? { right: `${Math.max(4, ((visibleMonths.length - 1 - hoveredMonthIdx) / visibleMonths.length) * 45 + 4)}%` }
                  : { left: `${Math.max(8, (hoveredMonthIdx / visibleMonths.length) * 55 + 8)}%` }
              }
            >
              <div className="font-semibold">{hoveredMonth.fullMonth}</div>
              <div className="mt-1 flex justify-between gap-4 tabular-nums">
                <span className="text-white/70">Collected</span>
                <span className="font-semibold">
                  {formatCurrency(hoveredMonth.revenue, settings.currency)}
                </span>
              </div>
              <div className="flex justify-between gap-4 tabular-nums text-[11px] text-white/75 mt-0.5">
                <span>Target</span>
                <span>{formatCurrency(hoveredMonth.target, settings.currency)}</span>
              </div>
              <div className="mt-1 pt-1 border-t border-white/15 text-[10.5px] text-amber-300 tabular-nums">
                {hoveredMonth.invoicesCount} invoices paid
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Industry Breakdown + Lead Source Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-4">
            Lifetime revenue by client industry
          </h2>
          <div className="space-y-4">
            {industryTotals.slice(0, 6).map((item) => {
              const pct = Math.round((item.total / maxIndustryVal) * 100);
              return (
                <div key={item.industry}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-[#1A1D24]">
                      {item.industry}{' '}
                      <span className="text-[#7A808D] font-normal tabular-nums">
                        · {item.count} {item.count === 1 ? 'client' : 'clients'}
                      </span>
                    </span>
                    <span className="tabular-nums font-semibold text-[#1A1D24]">
                      {formatCurrency(item.total, settings.currency)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[#F3F1EC] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#13233A] rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-4">
            Pipeline performance by lead source
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#ECEAE4] text-[#7A808D]">
                  <th className="py-2.5 font-medium">Source</th>
                  <th className="py-2.5 font-medium text-right">Deals</th>
                  <th className="py-2.5 font-medium text-right">Won</th>
                  <th className="py-2.5 font-medium text-right">Pipeline value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECEAE4]">
                {sourceStats.map((row) => (
                  <tr key={row.source}>
                    <td className="py-3 font-medium text-[#1A1D24]">{row.source}</td>
                    <td className="py-3 text-right tabular-nums text-[#525866]">
                      {row.count}
                    </td>
                    <td className="py-3 text-right tabular-nums text-emerald-700 font-medium">
                      {row.won}
                    </td>
                    <td className="py-3 text-right tabular-nums font-semibold text-[#1A1D24]">
                      {formatCurrency(row.value, settings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Clients Table */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-[#ECEAE4] flex items-center justify-between">
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
            Top accounts by lifetime value
          </h2>
          <button
            type="button"
            onClick={() => navigateTo('clients')}
            className="text-xs font-medium text-[#13233A] hover:underline cursor-pointer"
          >
            View all clients
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs min-w-[540px]">
            <thead>
              <tr className="border-b border-[#ECEAE4] bg-[#FAF9F6] text-[#7A808D]">
                <th className="py-3 px-6 font-medium">Company</th>
                <th className="py-3 px-4 font-medium">Primary contact</th>
                <th className="py-3 px-4 font-medium">Industry</th>
                <th className="py-3 px-4 font-medium">Status</th>
                <th className="py-3 px-6 font-medium text-right">Total value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECEAE4]">
              {[...clients]
                .sort((a, b) => b.totalValue - a.totalValue)
                .slice(0, 5)
                .map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigateTo('clients', { clientId: c.id })}
                    className="hover:bg-[#FAF9F6] cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-6 font-semibold text-[#1A1D24]">{c.company}</td>
                    <td className="py-3.5 px-4 text-[#525866]">{c.name}</td>
                    <td className="py-3.5 px-4 text-[#525866]">{c.industry}</td>
                    <td className="py-3.5 px-4 text-[#13233A] font-medium">{c.status}</td>
                    <td className="py-3.5 px-6 text-right tabular-nums font-semibold text-[#1A1D24]">
                      {formatCurrency(c.totalValue, settings.currency)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
