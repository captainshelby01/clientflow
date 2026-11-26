import React, { useEffect, useState } from 'react';
import { Check, Copy, FileText, Loader2, RefreshCw, Send, Sparkles, X } from 'lucide-react';
import { useCRM } from '../../context/CRMContext';
import { formatCurrency, getCurrentTimeHHMM, getTodayISO } from '../../utils/format';

type DraftMode = 'follow_up' | 'proposal';
type DraftTone = 'warm' | 'concise' | 'executive';

export const AIDraftModal: React.FC = () => {
  const {
    aiDraftTarget,
    closeAIDraftModal,
    settings,
    logCommunication,
    updateLead,
    leads,
    showToast,
  } = useCRM();

  const [mode, setMode] = useState<DraftMode>('follow_up');
  const [tone, setTone] = useState<DraftTone>('warm');
  const [customInstructions, setCustomInstructions] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [subject, setSubject] = useState('');
  const [summary, setSummary] = useState('');
  const [body, setBody] = useState('');
  const [suggestedNextStep, setSuggestedNextStep] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!aiDraftTarget) return;
    setMode(aiDraftTarget.initialMode ?? 'follow_up');
    setTone('warm');
    setCustomInstructions('');
    setSubject('');
    setSummary('');
    setBody('');
    setSuggestedNextStep('');
    setError(null);
    setCopied(false);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAIDraftModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [aiDraftTarget, closeAIDraftModal]);

  if (!aiDraftTarget) return null;

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCopied(false);

    try {
      const res = await fetch('/api/ai/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draftType: mode,
          tone,
          recipientName: aiDraftTarget.recipientName,
          recipientRole: aiDraftTarget.recipientRole,
          company: aiDraftTarget.company,
          industry: aiDraftTarget.industry,
          scope: aiDraftTarget.scope,
          dealValueFormatted: aiDraftTarget.dealValue
            ? formatCurrency(aiDraftTarget.dealValue, settings.currency)
            : '',
          stageOrStatus: aiDraftTarget.stageOrStatus,
          senderName: settings.ownerName,
          workspaceName: settings.workspaceName,
          recentContext: aiDraftTarget.recentContext,
          customInstructions: customInstructions.trim(),
        }),
      });

      const payload = (await res.json()) as {
        subject?: string;
        summary?: string;
        body?: string;
        suggestedNextStep?: string;
        error?: string;
      };

      if (!res.ok) {
        throw new Error(payload.error || 'Unable to generate draft right now.');
      }

      setSubject(payload.subject ?? '');
      setSummary(payload.summary ?? '');
      setBody(payload.body ?? '');
      setSuggestedNextStep(payload.suggestedNextStep ?? '');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to reach AI drafting service.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!body.trim()) return;
    const text = subject.trim() ? `Subject: ${subject.trim()}\n\n${body.trim()}` : body.trim();
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      showToast('Draft copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast('Select text manually to copy');
    }
  };

  const handleSaveToCRM = () => {
    if (!body.trim()) return;
    const today = getTodayISO();

    if (aiDraftTarget.targetType === 'client') {
      logCommunication(aiDraftTarget.targetId, {
        type: mode === 'proposal' ? 'Proposal' : 'Email',
        title: subject.trim() || `${mode === 'proposal' ? 'Proposal' : 'Follow-up'} drafted`,
        summary: summary.trim() || body.trim().slice(0, 180),
        date: today,
        time: getCurrentTimeHHMM(),
      });
      closeAIDraftModal();
      return;
    }

    const lead = leads.find((l) => l.id === aiDraftTarget.targetId);
    if (lead) {
      const existing = lead.notes ? `${lead.notes}\n\n` : '';
      const label = mode === 'proposal' ? 'AI Proposal Draft' : 'AI Follow-up Draft';
      const entry = `[${today} · ${label}] ${subject.trim()}\n${summary.trim() || body.trim().slice(0, 220)}`;
      updateLead(lead.id, { notes: `${existing}${entry}` });
      showToast(`Saved ${mode === 'proposal' ? 'proposal' : 'follow-up'} draft to lead notes`);
      closeAIDraftModal();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#13233A]/35 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-draft-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAIDraftModal();
      }}
    >
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECEAE4] sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#FEF6E9] border border-[#F2DEC0] flex items-center justify-center text-[#B4690E] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h2
                id="ai-draft-title"
                className="text-base font-semibold text-[#1A1D24] font-display truncate"
              >
                Draft with Gemini
              </h2>
              <p className="text-xs text-[#7A808D] truncate">
                {aiDraftTarget.recipientName} · {aiDraftTarget.company} ({aiDraftTarget.stageOrStatus})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeAIDraftModal}
            className="p-1.5 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer shrink-0"
            aria-label="Close AI draft modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Controls */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1.5">
                Draft type
              </label>
              <div className="grid grid-cols-2 gap-1.5 bg-[#F3F1EC] p-1 rounded-lg border border-[#E5E2DC]">
                <button
                  type="button"
                  onClick={() => setMode('follow_up')}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    mode === 'follow_up'
                      ? 'bg-white text-[#13233A] shadow-2xs font-semibold'
                      : 'text-[#525866] hover:text-[#1A1D24]'
                  }`}
                >
                  Follow-up Email
                </button>
                <button
                  type="button"
                  onClick={() => setMode('proposal')}
                  className={`py-1.5 px-2.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                    mode === 'proposal'
                      ? 'bg-white text-[#13233A] shadow-2xs font-semibold'
                      : 'text-[#525866] hover:text-[#1A1D24]'
                  }`}
                >
                  Proposal Outline
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#525866] mb-1.5">
                Tone
              </label>
              <div className="grid grid-cols-3 gap-1.5 bg-[#F3F1EC] p-1 rounded-lg border border-[#E5E2DC]">
                {(
                  [
                    { id: 'warm', label: 'Warm' },
                    { id: 'concise', label: 'Concise' },
                    { id: 'executive', label: 'Executive' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTone(item.id)}
                    className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                      tone === item.id
                        ? 'bg-white text-[#13233A] shadow-2xs font-semibold'
                        : 'text-[#525866] hover:text-[#1A1D24]'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-[#525866]">
                Optional guidance or angle
              </label>
              <span className="text-[11px] text-[#7A808D]">
                Scope: {aiDraftTarget.scope}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={customInstructions}
                onChange={(e) => setCustomInstructions(e.target.value)}
                placeholder={
                  mode === 'follow_up'
                    ? 'e.g. Check in on contract review and suggest a 15-min call Thursday...'
                    : 'e.g. Break scope into Discovery and Design Sprint phases over 5 weeks...'
                }
                className="flex-1 px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none"
              />
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] disabled:opacity-60 transition-colors cursor-pointer whitespace-nowrap shrink-0"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Drafting...
                  </>
                ) : body ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    Generate Draft
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 leading-relaxed">
              {error}
            </div>
          )}

          {!body && !isLoading && !error && (
            <div className="bg-[#FAF9F6] border border-[#ECEAE4] rounded-lg p-5 text-center space-y-1.5">
              <div className="text-xs font-semibold text-[#1A1D24]">
                Grounded in your CRM record
              </div>
              <p className="text-xs text-[#525866] max-w-md mx-auto leading-relaxed">
                Gemini uses {aiDraftTarget.company}&apos;s scope, deal value, and recent notes to write a ready-to-edit {mode === 'follow_up' ? 'follow-up email' : 'proposal outline'}.
              </p>
            </div>
          )}

          {body && (
            <div className="space-y-3 pt-2 border-t border-[#ECEAE4]">
              <div>
                <label className="block text-[11px] font-medium text-[#525866] mb-1">
                  Subject / Title
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium bg-white border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#525866] mb-1">
                  Draft content (editable)
                </label>
                <textarea
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full px-3 py-2.5 text-xs leading-relaxed bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none resize-y font-sans"
                />
              </div>

              {suggestedNextStep && (
                <div className="flex items-start gap-2.5 px-3.5 py-2.5 bg-[#FEF6E9] border border-[#F2DEC0] rounded-lg text-xs text-[#1A1D24]">
                  <FileText className="w-3.5 h-3.5 text-[#B4690E] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-[#B4690E]">Suggested next step: </span>
                    <span className="text-[#525866]">{suggestedNextStep}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#ECEAE4] bg-[#FAF9F6] flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={closeAIDraftModal}
            className="px-3.5 py-2 text-xs font-medium text-[#525866] bg-white border border-[#E5E2DC] rounded-lg hover:bg-[#F3F1EC] cursor-pointer"
          >
            Close
          </button>

          {body && (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy Draft'}
              </button>
              <button
                type="button"
                onClick={handleSaveToCRM}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                {aiDraftTarget.targetType === 'client' ? 'Log to Timeline' : 'Save to Lead Notes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
