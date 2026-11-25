import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { CurrencyCode } from '../../types/crm';

export const AboutProjectModal: React.FC = () => {
  const { isAboutOpen, closeAboutModal, settings, updateSettings, navigateTo } = useCRM();

  useEffect(() => {
    if (!isAboutOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAboutModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isAboutOpen, closeAboutModal]);

  if (!isAboutOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-clientflow-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAboutModal();
      }}
    >
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4]">
          <div className="flex items-center gap-2.5">
            <svg
              width="24"
              height="24"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <rect width="28" height="28" rx="7" fill="#13233A" />
              <path
                d="M17.8 10.6C16.8 9.6 15.5 9.1 14 9.1C11.1 9.1 9 11.3 9 14C9 16.7 11.1 18.9 14 18.9C15.5 18.9 16.8 18.4 17.8 17.4"
                stroke="#FFFFFF"
                strokeWidth="2.2"
                strokeLinecap="round"
              />
              <circle cx="18.2" cy="14" r="1.4" fill="#D98A2B" />
            </svg>
            <h2 id="about-clientflow-title" className="text-base font-semibold text-[#1A1D24] font-display">
              About ClientFlow
            </h2>
          </div>
          <button
            type="button"
            onClick={closeAboutModal}
            className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm text-[#1A1D24] leading-relaxed">
              <strong>ClientFlow</strong> is a calm, practical CRM workspace designed for independent
              consultants, freelancers, and small creative studios. It replaces bloated enterprise
              software with clear client workflows—from initial inquiry to signed retainer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4]">
              <div className="font-semibold text-[#1A1D24]">6-Stage Leads Pipeline</div>
              <p className="text-[#525866] mt-1 leading-relaxed">
                Track opportunities from New Lead to Won/Lost with drag-and-drop, weighted forecasts,
                and one-click client conversion.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4]">
              <div className="font-semibold text-[#1A1D24]">360° Client Profiles</div>
              <p className="text-[#525866] mt-1 leading-relaxed">
                Keep contact details, active projects, historical deliverables, notes, files, and
                communication timelines in one view.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4]">
              <div className="font-semibold text-[#1A1D24]">Follow-up Scheduling</div>
              <p className="text-[#525866] mt-1 leading-relaxed">
                Schedule calls and email check-ins directly from client profiles or leads—automatically
                syncing tasks and timelines.
              </p>
            </div>
            <div className="p-3.5 rounded-lg bg-[#FAF9F6] border border-[#ECEAE4]">
              <div className="font-semibold text-[#1A1D24]">Multi-Currency Reporting</div>
              <p className="text-[#525866] mt-1 leading-relaxed">
                Monitor revenue vs. targets, industry mix, and lead source conversion across USD, NGN,
                GBP, and EUR with CSV export.
              </p>
            </div>
          </div>

          {/* Live Currency Preview Switcher */}
          <div className="pt-4 border-t border-[#ECEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold text-[#1A1D24]">
                Preview display currency
              </div>
              <div className="text-[11.5px] text-[#7A808D]">
                Switch currencies to preview local or international workflows
              </div>
            </div>
            <div className="flex items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC] self-start sm:self-auto">
              {(['USD', 'NGN', 'GBP', 'EUR'] as CurrencyCode[]).map((code) => (
                <button
                  key={code}
                  type="button"
                  onClick={() => updateSettings({ currency: code })}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    settings.currency === code
                      ? 'bg-white text-[#1A1D24] shadow-2xs'
                      : 'text-[#525866] hover:text-[#1A1D24]'
                  }`}
                >
                  {code}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-[#ECEAE4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-[#525866]">
              Designed & built by{' '}
              <span className="font-semibold text-[#1A1D24]">{settings.ownerName}</span> ·{' '}
              {settings.workspaceName}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  closeAboutModal();
                  navigateTo('leads');
                }}
                className="px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
              >
                Explore Pipeline
              </button>
              <button
                type="button"
                onClick={closeAboutModal}
                className="px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer"
              >
                Back to Workspace
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
