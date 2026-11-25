import React from 'react';
import { CurrencyCode, Lead, LeadStage } from '../../types/crm';
import { formatCurrency } from '../../utils/format';

interface PipelineChartProps {
  leads: Lead[];
  currency: CurrencyCode;
  onSelectStage: (stage: LeadStage) => void;
}

const ACTIVE_STAGES: LeadStage[] = ['New Lead', 'Contacted', 'Proposal Sent', 'Negotiation'];

export const PipelineChart: React.FC<PipelineChartProps> = ({
  leads,
  currency,
  onSelectStage,
}) => {
  const stageStats = ACTIVE_STAGES.map((stage) => {
    const items = leads.filter((l) => l.stage === stage);
    const total = items.reduce((sum, l) => sum + l.value, 0);
    return { stage, count: items.length, total };
  });

  const openTotal = stageStats.reduce((sum, s) => sum + s.total, 0);
  const maxStageVal = Math.max(...stageStats.map((s) => s.total), 1);
  const wonLeads = leads.filter((l) => l.stage === 'Won');
  const wonTotal = wonLeads.reduce((sum, l) => sum + l.value, 0);

  return (
    <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
              Sales pipeline
            </h2>
            <p className="text-xs text-[#7A808D] mt-0.5">
              Select a stage to inspect open deals
            </p>
          </div>
          <span className="text-xs tabular-nums font-semibold text-[#1A1D24] whitespace-nowrap">
            {formatCurrency(openTotal, currency)} open
          </span>
        </div>

        <div className="space-y-4">
          {stageStats.map((item) => {
            const pct = Math.max(
              Math.round((item.total / maxStageVal) * 100),
              item.total > 0 ? 6 : 0
            );
            const isNegotiation = item.stage === 'Negotiation';
            return (
              <button
                key={item.stage}
                type="button"
                onClick={() => onSelectStage(item.stage)}
                className="w-full text-left group cursor-pointer rounded-md p-1.5 -mx-1.5 hover:bg-[#FAF9F6] transition-colors"
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-[#1A1D24] group-hover:text-[#13233A] transition-colors flex items-center gap-1.5">
                    <span>{item.stage}</span>
                    <span className="text-[#7A808D] font-normal tabular-nums">
                      · {item.count} {item.count === 1 ? 'deal' : 'deals'}
                    </span>
                  </span>
                  <span className="tabular-nums text-[#1A1D24] font-semibold">
                    {formatCurrency(item.total, currency)}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-[#F3F1EC] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      isNegotiation
                        ? 'bg-[#B4690E] group-hover:bg-[#99570B]'
                        : 'bg-[#13233A] group-hover:bg-[#1D3454]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[#ECEAE4] flex items-center justify-between text-xs">
        <span className="text-[#525866]">
          Closed won ({wonLeads.length})
        </span>
        <span className="tabular-nums font-semibold text-emerald-700">
          {formatCurrency(wonTotal, currency)} closed
        </span>
      </div>
    </div>
  );
};
