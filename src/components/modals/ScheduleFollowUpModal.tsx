import React, { useEffect, useState } from 'react';
import { Calendar, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { TODAY_ISO } from '../../data/initialData';
import { FollowUp } from '../../types/crm';

export const ScheduleFollowUpModal: React.FC = () => {
  const { followUpModalTarget, closeFollowUpModal, scheduleFollowUp } = useCRM();

  const [date, setDate] = useState(TODAY_ISO);
  const [time, setTime] = useState('10:00');
  const [channel, setChannel] = useState<FollowUp['channel']>('Video Call');
  const [agenda, setAgenda] = useState('');

  useEffect(() => {
    if (!followUpModalTarget) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeFollowUpModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [followUpModalTarget, closeFollowUpModal]);

  if (!followUpModalTarget) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agenda.trim()) return;

    scheduleFollowUp({
      targetType: followUpModalTarget.targetType,
      targetId: followUpModalTarget.targetId,
      contactName: followUpModalTarget.contactName,
      company: followUpModalTarget.company,
      date,
      time,
      channel,
      agenda: agenda.trim(),
    });

    setAgenda('');
    closeFollowUpModal();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="schedule-followup-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeFollowUpModal();
      }}
    >
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FEF6E9] border border-[#F2DEC0] flex items-center justify-center text-[#B4690E]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="schedule-followup-title"
                className="text-base font-semibold text-[#1A1D24] font-display"
              >
                Schedule Follow-up
              </h2>
              <p className="text-xs text-[#7A808D]">
                {followUpModalTarget.contactName} · {followUpModalTarget.company}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeFollowUpModal}
            className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1">
                Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm tabular-nums bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Channel
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(['Video Call', 'Call', 'Email', 'In-person'] as FollowUp['channel'][]).map(
                (ch) => (
                  <button
                    key={ch}
                    type="button"
                    onClick={() => setChannel(ch)}
                    className={`px-2.5 py-2 text-xs font-medium rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                      channel === ch
                        ? 'bg-[#13233A] text-white border-[#13233A]'
                        : 'bg-white text-[#525866] border-[#E5E2DC] hover:bg-[#FAF9F6]'
                    }`}
                  >
                    {ch}
                  </button>
                )
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Follow-up agenda *
            </label>
            <textarea
              rows={3}
              value={agenda}
              onChange={(e) => setAgenda(e.target.value)}
              placeholder="e.g. Review updated Phase 2 scope and confirm Q1 kickoff date"
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none resize-none"
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#ECEAE4]">
            <button
              type="button"
              onClick={closeFollowUpModal}
              className="px-4 py-2 text-xs font-medium text-[#525866] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap shrink-0"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-[#13233A] rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap shrink-0"
            >
              Confirm Follow-up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
