import React, { useEffect, useState } from 'react';
import { Calendar, Mail, Phone, Trash2, UserCheck, Users, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { LEAD_STAGES, LeadStage } from '../../types/crm';
import { formatCurrency, formatDisplayDate } from '../../utils/format';

export const LeadDetailDrawer: React.FC = () => {
  const {
    leads,
    clients,
    selectedLeadId,
    setSelectedLeadId,
    moveLeadStage,
    updateLead,
    convertLeadToClient,
    deleteLead,
    openFollowUpModal,
    navigateTo,
    settings,
  } = useCRM();

  const lead = leads.find((l) => l.id === selectedLeadId);
  const [noteDraft, setNoteDraft] = useState('');

  useEffect(() => {
    if (!lead) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedLeadId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lead, setSelectedLeadId]);

  if (!lead) return null;

  // Resolve any existing linked or matching-company client
  const linkedClient =
    (lead.convertedClientId && clients.find((c) => c.id === lead.convertedClientId)) ||
    clients.find((c) => c.company.toLowerCase() === lead.company.toLowerCase()) ||
    null;

  const handleSaveNotes = () => {
    if (!noteDraft.trim()) return;
    const prefix = lead.notes ? `${lead.notes}\n\n` : '';
    updateLead(lead.id, { notes: `${prefix}${noteDraft.trim()}` });
    setNoteDraft('');
  };

  const handleViewOrConvertClient = () => {
    if (linkedClient) {
      setSelectedLeadId(null);
      navigateTo('clients', { clientId: linkedClient.id });
      return;
    }
    const clientId = convertLeadToClient(lead.id);
    setSelectedLeadId(null);
    if (clientId) {
      navigateTo('clients', { clientId });
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-[#13233A]/30"
      role="dialog"
      aria-modal="true"
      aria-label={`Lead details for ${lead.name}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedLeadId(null);
      }}
    >
      <div className="bg-white border-l border-[#E5E2DC] w-full max-w-md h-full overflow-y-auto flex flex-col justify-between shadow-xl">
        <div>
          <div className="px-6 py-5 border-b border-[#ECEAE4] flex items-start justify-between gap-4">
            <div>
              <div className="text-xs text-[#7A808D]">
                {lead.company} · {lead.industry}
              </div>
              <h2 className="text-lg font-semibold text-[#1A1D24] font-display mt-0.5">
                {lead.name}
              </h2>
              <p className="text-xs text-[#525866]">{lead.role}</p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedLeadId(null)}
              className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
              aria-label="Close lead drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4 pb-5 border-b border-[#ECEAE4]">
              <div>
                <div className="text-xs text-[#7A808D]">Deal value</div>
                <div className="text-xl font-bold text-[#1A1D24] font-display tabular-nums mt-0.5">
                  {formatCurrency(lead.value, settings.currency)}
                </div>
                <div className="text-xs text-[#525866] mt-0.5 tabular-nums">
                  {lead.probability}% win probability
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#7A808D] mb-1">Pipeline stage</label>
                <select
                  value={lead.stage}
                  onChange={(e) => moveLeadStage(lead.id, e.target.value as LeadStage)}
                  className="w-full px-2.5 py-2 text-xs font-medium bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg text-[#1A1D24] focus:border-[#13233A] focus:outline-none cursor-pointer"
                >
                  {LEAD_STAGES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-3 pb-5 border-b border-[#ECEAE4]">
              <div>
                <div className="text-xs text-[#7A808D]">Scope of work</div>
                <div className="text-sm font-medium text-[#1A1D24] mt-0.5">
                  {lead.serviceScope}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 text-xs text-[#525866] pt-1">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#7A808D]" />
                  <a
                    href={`mailto:${lead.email}`}
                    className="hover:text-[#13233A] underline-offset-2 hover:underline"
                  >
                    {lead.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#7A808D]" />
                  <span className="tabular-nums">{lead.phone}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div>
                  <span className="text-[#7A808D] block">Lead source</span>
                  <span className="text-[#1A1D24] font-medium">{lead.source}</span>
                </div>
                <div>
                  <span className="text-[#7A808D] block">Expected close</span>
                  <span className="text-[#1A1D24] tabular-nums">
                    {formatDisplayDate(lead.expectedCloseDate)}
                  </span>
                </div>
                <div>
                  <span className="text-[#7A808D] block">Next follow-up</span>
                  <span className="text-[#B4690E] tabular-nums font-medium">
                    {lead.nextFollowUpDate ? formatDisplayDate(lead.nextFollowUpDate) : 'Not scheduled'}
                  </span>
                </div>
                <div>
                  <span className="text-[#7A808D] block">Added</span>
                  <span className="text-[#1A1D24] tabular-nums">
                    {formatDisplayDate(lead.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Primary Lead Actions */}
            <div className="flex flex-wrap gap-2.5 pb-5 border-b border-[#ECEAE4]">
              <button
                type="button"
                onClick={handleViewOrConvertClient}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap shrink-0"
              >
                {linkedClient ? (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    View Client Profile
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5" />
                    Convert & View Client Profile
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() =>
                  openFollowUpModal({
                    targetType: 'lead',
                    targetId: lead.id,
                    contactName: lead.name,
                    company: lead.company,
                  })
                }
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap shrink-0"
              >
                <Calendar className="w-3.5 h-3.5 text-[#B4690E]" />
                Schedule Follow-up
              </button>
            </div>

            <div>
              <h3 className="text-xs font-semibold text-[#1A1D24] mb-2">Deal notes</h3>
              {lead.notes ? (
                <div className="text-xs text-[#525866] leading-relaxed whitespace-pre-line bg-[#FAF9F6] border border-[#ECEAE4] rounded-lg p-3 mb-3">
                  {lead.notes}
                </div>
              ) : (
                <p className="text-xs text-[#7A808D] mb-3">No notes recorded yet.</p>
              )}

              <div className="space-y-2">
                <textarea
                  rows={2}
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder="Append call note or next step..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  disabled={!noteDraft.trim()}
                  className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] disabled:opacity-45 cursor-pointer"
                >
                  Add Note
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-[#ECEAE4] bg-[#FAF9F6] flex items-center justify-between">
          <button
            type="button"
            onClick={() => deleteLead(lead.id)}
            className="inline-flex items-center gap-1.5 text-xs text-red-700 hover:text-red-800 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Remove Lead
          </button>
          <button
            type="button"
            onClick={() => setSelectedLeadId(null)}
            className="px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#F3F1EC] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
