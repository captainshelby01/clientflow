import React, { useState } from 'react';
import { MonthlyRevenuePoint, CurrencyCode } from '../../types/crm';
import { formatCurrency } from '../../utils/format';

interface RevenueChartProps {
  data: MonthlyRevenuePoint[];
  currency: CurrencyCode;
  range: '6m' | '12m';
  onRangeChange: (r: '6m' | '12m') => void;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  data,
  currency,
  range,
  onRangeChange,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const visibleData = range === '6m' ? data.slice(-6) : data;
  const maxVal = Math.max(...visibleData.map((d) => Math.max(d.revenue, d.target)), 1000);
  const stepUnit = maxVal > 20000 ? 10000 : 5000;
  const yMax = Math.ceil((maxVal * 1.15) / stepUnit) * stepUnit;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(yMax * t));

  const width = 640;
  const height = 228;
  const padLeft = 58;
  const padRight = 18;
  const padTop = 20;
  const padBottom = 32;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const getX = (idx: number) =>
    visibleData.length <= 1
      ? padLeft + plotW / 2
      : padLeft + (idx / (visibleData.length - 1)) * plotW;

  const getY = (val: number) => padTop + plotH - (val / yMax) * plotH;

  const linePath = visibleData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(d.revenue).toFixed(1)}`)
    .join(' ');

  const areaPath =
    visibleData.length > 0
      ? `${linePath} L ${getX(visibleData.length - 1).toFixed(1)} ${(padTop + plotH).toFixed(1)} L ${getX(0).toFixed(1)} ${(padTop + plotH).toFixed(1)} Z`
      : '';

  const targetPath = visibleData
    .map((d, idx) => `${idx === 0 ? 'M' : 'L'} ${getX(idx).toFixed(1)} ${getY(d.target).toFixed(1)}`)
    .join(' ');

  const hoveredPoint = hoveredIdx !== null ? visibleData[hoveredIdx] : null;
  const totalPeriod = visibleData.reduce((s, d) => s + d.revenue, 0);
  const totalInvoices = visibleData.reduce((s, d) => s + d.invoicesCount, 0);

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col justify-between h-full">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
            Monthly revenue
          </h2>
          <p className="text-xs text-[#7A808D] mt-0.5 tabular-nums">
            {formatCurrency(totalPeriod, currency)} collected across {totalInvoices} invoices
          </p>
        </div>
        <div className="flex items-center gap-1 p-0.5 bg-[#F3F1EC] rounded-lg border border-[#E5E2DC]">
          <button
            type="button"
            onClick={() => onRangeChange('6m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              range === '6m'
                ? 'bg-white text-[#1A1D24] shadow-2xs'
                : 'text-[#525866] hover:text-[#1A1D24]'
            }`}
          >
            6 months
          </button>
          <button
            type="button"
            onClick={() => onRangeChange('12m')}
            className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
              range === '12m'
                ? 'bg-white text-[#1A1D24] shadow-2xs'
                : 'text-[#525866] hover:text-[#1A1D24]'
            }`}
          >
            12 months
          </button>
        </div>
      </div>

      <div className="relative w-full">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label="Monthly revenue line chart"
        >
          <defs>
            <linearGradient id="cf-rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#13233A" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#13233A" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Horizontal gridlines */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#EFECE6"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 10}
                  y={y + 3.5}
                  textAnchor="end"
                  className="fill-[#7A808D] text-[10.5px] font-sans tabular-nums"
                >
                  {formatCurrency(tick, currency, true)}
                </text>
              </g>
            );
          })}

          {/* Subtle target dashed line */}
          <path
            d={targetPath}
            fill="none"
            stroke="#CBC5BA"
            strokeWidth="1.25"
            strokeDasharray="4 4"
          />

          {/* Area fill */}
          <path d={areaPath} fill="url(#cf-rev-fill)" />

          {/* Main Revenue Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#13233A"
            strokeWidth="2.1"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover vertical guide line */}
          {hoveredIdx !== null && (
            <line
              x1={getX(hoveredIdx)}
              y1={padTop}
              x2={getX(hoveredIdx)}
              y2={padTop + plotH}
              stroke="#D5D0C6"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Data points & hit zones */}
          {visibleData.map((d, idx) => {
            const cx = getX(idx);
            const cy = getY(d.revenue);
            const isHovered = hoveredIdx === idx;
            return (
              <g key={d.month}>
                <text
                  x={cx}
                  y={height - 8}
                  textAnchor="middle"
                  className={`text-[11px] font-sans ${
                    isHovered ? 'fill-[#1A1D24] font-semibold' : 'fill-[#7A808D]'
                  }`}
                >
                  {d.month}
                </text>
                <circle
                  cx={cx}
                  cy={cy}
                  r={isHovered ? 4.5 : 3}
                  fill={isHovered ? '#B4690E' : '#FFFFFF'}
                  stroke="#13233A"
                  strokeWidth={isHovered ? 2 : 1.75}
                />
                <rect
                  x={cx - plotW / visibleData.length / 2}
                  y={padTop}
                  width={plotW / visibleData.length}
                  height={plotH + padBottom}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              </g>
            );
          })}
        </svg>

        {/* Edge-aware Hover Tooltip */}
        {hoveredPoint && hoveredIdx !== null && (
          <div
            className="pointer-events-none absolute top-0 bg-[#13233A] text-white px-3.5 py-2.5 rounded-lg shadow-md text-xs z-10 min-w-[164px]"
            style={
              hoveredIdx >= Math.floor(visibleData.length / 2)
                ? { right: `${Math.max(4, ((visibleData.length - 1 - hoveredIdx) / Math.max(visibleData.length - 1, 1)) * 45 + 4)}%` }
                : { left: `${Math.max(8, (hoveredIdx / Math.max(visibleData.length - 1, 1)) * 55 + 8)}%` }
            }
          >
            <div className="font-semibold text-white">{hoveredPoint.fullMonth}</div>
            <div className="mt-1.5 flex items-center justify-between gap-4 tabular-nums">
              <span className="text-white/70">Collected</span>
              <span className="font-semibold">
                {formatCurrency(hoveredPoint.revenue, currency)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 tabular-nums text-[11px] text-white/75 mt-0.5">
              <span>Target</span>
              <span>{formatCurrency(hoveredPoint.target, currency)}</span>
            </div>
            <div className="mt-1 pt-1 border-t border-white/15 text-[10.5px] text-amber-300 tabular-nums">
              {hoveredPoint.invoicesCount} invoices settled
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-3.5 border-t border-[#ECEAE4] flex flex-wrap items-center justify-between gap-2 text-xs text-[#7A808D]">
        <div className="flex items-center gap-5">
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-[2px] bg-[#13233A] inline-block" />
            <span>Collected revenue</span>
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="w-3.5 h-0 border-t border-dashed border-[#A8A298] inline-block" />
            <span>Monthly target</span>
          </span>
        </div>
        <span className="tabular-nums text-[#525866]">
          Hover any month for breakdown
        </span>
      </div>
    </div>
  );
};
