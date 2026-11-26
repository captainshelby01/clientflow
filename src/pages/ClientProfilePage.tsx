import React, { useState } from 'react';
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  Globe,
  Mail,
  MapPin,
  MessageSquare,
  Paperclip,
  Phone,
  Pin,
  Plus,
  Send,
  Sparkles,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { ClientFile, ClientStatus, CommunicationEntry } from '../types/crm';
import { formatCurrency, formatDisplayDate, getCurrentTimeHHMM, getInitials, getTodayISO } from '../utils/format';

export const ClientProfilePage: React.FC<{ clientId: string }> = ({ clientId }) => {
  const {
    clients,
    projects,
    followUps,
    settings,
    navigateTo,
    updateClient,
    addClientNote,
    togglePinNote,
    addClientFile,
    logCommunication,
    openFollowUpModal,
    openAIDraftModal,
    completeFollowUp,
    showToast,
  } = useCRM();

  const client = clients.find((c) => c.id === clientId);

  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'files'>('overview');
  const [noteInput, setNoteInput] = useState('');
  const [commType, setCommType] = useState<CommunicationEntry['type']>('Email');
  const [commTitle, setCommTitle] = useState('');
  const [commSummary, setCommSummary] = useState('');
  const [showAddFileForm, setShowAddFileForm] = useState(false);
  const [fileName, setFileName] = useState('');
  const [fileCategory, setFileCategory] = useState<ClientFile['category']>('Deliverable');
  const [fileType, setFileType] = useState<ClientFile['fileType']>('PDF');

  if (!client) {
    return (
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-10 text-center">
        <p className="text-sm font-medium text-[#1A1D24]">Client profile not found.</p>
        <button
          type="button"
          onClick={() => navigateTo('clients', { clientId: null })}
          className="mt-4 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg cursor-pointer"
        >
          Back to Clients
        </button>
      </div>
    );
  }

  const clientProjects = projects.filter((p) => p.clientId === client.id);
  const activeProjects = clientProjects.filter((p) => p.status !== 'Completed');
  const projectHistory = clientProjects.filter((p) => p.status === 'Completed');

  const clientFollowUps = followUps
    .filter((f) => f.targetType === 'client' && f.targetId === client.id && !f.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
  const nextFollowUp = clientFollowUps[0] ?? null;

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;
    addClientNote(client.id, noteInput.trim());
    setNoteInput('');
  };

  const handleLogCommunication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commTitle.trim()) return;
    const time = getCurrentTimeHHMM();
    logCommunication(client.id, {
      type: commType,
      title: commTitle.trim(),
      summary: commSummary.trim() || 'Logged directly from client timeline.',
      date: getTodayISO(),
      time,
    });
    setCommTitle('');
    setCommSummary('');
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;
    addClientFile(client.id, {
      name: fileName.trim(),
      category: fileCategory,
      fileType,
      size: '1.4 MB',
      summary: `${fileCategory} document attached to ${client.company} workspace.`,
    });
    setFileName('');
    setShowAddFileForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Back link & Profile Header */}
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={() => navigateTo('clients', { clientId: null })}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#525866] hover:text-[#13233A] self-start cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Clients
        </button>

        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="flex items-start sm:items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#13233A] text-white flex items-center justify-center font-display font-semibold text-base shrink-0">
              {getInitials(client.name)}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display">
                  {client.name}
                </h1>
                <span className="text-xs text-[#7A808D]">·</span>
                <span className="text-sm font-medium text-[#525866]">
                  {client.company}
                </span>
              </div>
              <div className="text-xs text-[#7A808D] mt-1 flex flex-wrap items-center gap-2">
                <span>{client.role}</span>
                <span>·</span>
                <span>{client.industry}</span>
                <span>·</span>
                <span>{client.location}</span>
                <span>·</span>
                <span className="tabular-nums">
                  Last contact {formatDisplayDate(client.lastContactDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="pr-3.5 border-r border-[#E5E2DC]">
              <div className="text-[11px] text-[#7A808D]">Lifetime value</div>
              <div className="text-lg font-bold font-display tabular-nums text-[#1A1D24]">
                {formatCurrency(client.totalValue, settings.currency)}
              </div>
            </div>

            <select
              value={client.status}
              onChange={(e) => {
                updateClient(client.id, { status: e.target.value as ClientStatus });
                showToast(`Status updated to ${e.target.value}`);
              }}
              aria-label="Client status"
              className="px-3 py-2 text-xs font-medium bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg text-[#1A1D24] focus:border-[#13233A] focus:outline-none cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Retainer">Retainer</option>
              <option value="Onboarding">Onboarding</option>
              <option value="Past">Past</option>
            </select>

            <button
              type="button"
              onClick={() => {
                const recentTimeline = client.timeline
                  .slice(0, 3)
                  .map((t) => `${t.date} (${t.type}): ${t.title} — ${t.summary}`)
                  .join('\n');
                const recentNotes = client.notes
                  .slice(0, 2)
                  .map((n) => n.content)
                  .join(' | ');
                openAIDraftModal({
                  targetType: 'client',
                  targetId: client.id,
                  initialMode: 'follow_up',
                  recipientName: client.name,
                  recipientRole: client.role,
                  company: client.company,
                  industry: client.industry,
                  scope:
                    activeProjects[0]?.title ||
                    client.tags.join(', ') ||
                    'Consulting & Design Retainer',
                  dealValue: client.totalValue,
                  stageOrStatus: client.status,
                  recentContext: [recentNotes, recentTimeline].filter(Boolean).join('\n'),
                });
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#B4690E]" />
              Draft with AI
            </button>

            <button
              type="button"
              onClick={() =>
                openFollowUpModal({
                  targetType: 'client',
                  targetId: client.id,
                  contactName: client.name,
                  company: client.company,
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Calendar className="w-3.5 h-3.5" />
              Schedule Follow-up
            </button>
          </div>
        </div>
      </div>

      {/* Next Follow-up Bar */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#FEF6E9] border border-[#F2DEC0] flex items-center justify-center text-[#B4690E] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          {nextFollowUp ? (
            <div className="text-xs sm:text-[13px] text-[#1A1D24]">
              <span className="font-semibold">Next follow-up:</span>{' '}
              <span className="tabular-nums font-medium text-[#B4690E]">
                {formatDisplayDate(nextFollowUp.date)} at {nextFollowUp.time}
              </span>{' '}
              <span className="text-[#7A808D]">({nextFollowUp.channel})</span> —{' '}
              <span className="text-[#525866]">{nextFollowUp.agenda}</span>
            </div>
          ) : (
            <div className="text-xs sm:text-[13px] text-[#525866]">
              No upcoming follow-up scheduled with {client.name}. Set a check-in to keep the account moving.
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {nextFollowUp && (
            <button
              type="button"
              onClick={() => completeFollowUp(nextFollowUp.id)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-md hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap"
            >
              <Check className="w-3.5 h-3.5 text-emerald-700" />
              Mark done
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              openFollowUpModal({
                targetType: 'client',
                targetId: client.id,
                contactName: client.name,
                company: client.company,
              })
            }
            className="px-3 py-1.5 text-xs font-medium bg-[#FAF9F6] border border-[#E5E2DC] text-[#13233A] rounded-md hover:bg-[#F3F1EC] cursor-pointer whitespace-nowrap"
          >
            {nextFollowUp ? 'Reschedule' : 'Schedule follow-up'}
          </button>
        </div>
      </div>

      {/* Main 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Contact Info + Active Projects + Project History */}
        <div className="lg:col-span-4 space-y-5">
          {/* Contact Information */}
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-4">
              Contact information
            </h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-[#1A1D24]">
                <Mail className="w-3.5 h-3.5 text-[#7A808D] shrink-0" />
                <a
                  href={`mailto:${client.email}`}
                  className="hover:text-[#13233A] hover:underline truncate"
                >
                  {client.email}
                </a>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1D24]">
                <Phone className="w-3.5 h-3.5 text-[#7A808D] shrink-0" />
                <span className="tabular-nums">{client.phone}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1D24]">
                <Globe className="w-3.5 h-3.5 text-[#7A808D] shrink-0" />
                <span>{client.website}</span>
              </div>
              <div className="flex items-center gap-2.5 text-[#1A1D24]">
                <MapPin className="w-3.5 h-3.5 text-[#7A808D] shrink-0" />
                <span>
                  {client.location} · {client.timezone}
                </span>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-[#ECEAE4] space-y-2.5 text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#7A808D]">Billing terms</span>
                <span className="font-medium text-[#1A1D24] text-right">{client.billingTerms}</span>
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[#7A808D]">Preferred channel</span>
                <span className="font-medium text-[#1A1D24]">{client.preferredChannel}</span>
              </div>
              {client.monthlyRetainer && (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[#7A808D]">Monthly retainer</span>
                  <span className="tabular-nums font-semibold text-[#13233A]">
                    {formatCurrency(client.monthlyRetainer, settings.currency)}/mo
                  </span>
                </div>
              )}
              <div className="pt-1 flex items-center justify-between gap-2">
                <span className="text-[#7A808D]">Scope areas</span>
                <span className="text-[#525866] text-right">
                  {client.tags.join(' · ')}
                </span>
              </div>
            </div>
          </div>

          {/* Active Projects */}
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
                Active projects
              </h2>
              <button
                type="button"
                onClick={() => navigateTo('projects')}
                className="text-xs font-medium text-[#525866] hover:text-[#13233A] cursor-pointer"
              >
                All projects
              </button>
            </div>

            {activeProjects.length > 0 ? (
              <div className="divide-y divide-[#ECEAE4]">
                {activeProjects.map((proj) => (
                  <div key={proj.id} className="py-3.5 first:pt-0 last:pb-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-[13px] font-semibold text-[#1A1D24]">
                          {proj.title}
                        </div>
                        <div className="text-[11.5px] text-[#7A808D] mt-0.5 tabular-nums">
                          {proj.status} · Due {formatDisplayDate(proj.dueDate)}
                        </div>
                      </div>
                      <span className="text-xs tabular-nums font-semibold text-[#1A1D24]">
                        {formatCurrency(proj.budget, settings.currency)}
                      </span>
                    </div>
                    <div className="mt-2.5 flex items-center gap-2.5">
                      <div className="flex-1 h-1.5 bg-[#F3F1EC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#13233A] rounded-full"
                          style={{ width: `${proj.progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] tabular-nums text-[#525866]">
                        {proj.progress}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-xs text-[#7A808D]">No active projects running.</p>
                <button
                  type="button"
                  onClick={() => navigateTo('projects')}
                  className="mt-2 text-xs font-medium text-[#13233A] hover:underline cursor-pointer"
                >
                  Open Projects workspace
                </button>
              </div>
            )}
          </div>

          {/* Project History */}
          <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-3">
              Project history
            </h2>
            {projectHistory.length > 0 ? (
              <div className="divide-y divide-[#ECEAE4]">
                {projectHistory.map((proj) => (
                  <div key={proj.id} className="py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[13px] font-medium text-[#1A1D24]">
                        {proj.title}
                      </span>
                      <span className="text-xs tabular-nums text-emerald-700 font-semibold">
                        {formatCurrency(proj.billed, settings.currency)}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#7A808D] mt-0.5">
                      Completed {formatDisplayDate(proj.dueDate)} · {proj.deliverables.join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#7A808D]">
                Completed client engagements will archive here automatically.
              </p>
            )}
          </div>
        </div>

        {/* Right Workspace: Communication Timeline, Notes, Files */}
        <div className="lg:col-span-8 space-y-5 min-w-0">
          {/* Sub-tabs */}
          <div className="flex items-center gap-4 sm:gap-6 border-b border-[#E5E2DC] overflow-x-auto crm-scroll">
            {[
              { id: 'overview', label: `Communication timeline (${client.timeline.length})` },
              { id: 'notes', label: `Notes (${client.notes.length})` },
              { id: 'files', label: `Files (${client.files.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`pb-3 text-[13px] font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                  activeTab === tab.id
                    ? 'border-[#13233A] text-[#13233A] font-semibold'
                    : 'border-transparent text-[#525866] hover:text-[#1A1D24]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Inline Log Communication Box */}
              <form
                onSubmit={handleLogCommunication}
                className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-[#1A1D24]">
                    Log communication
                  </span>
                  <div className="flex items-center gap-1 bg-[#F3F1EC] p-0.5 rounded-lg border border-[#E5E2DC]">
                    {(['Email', 'Call', 'Meeting', 'Proposal', 'Invoice'] as const).map(
                      (type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setCommType(type)}
                          className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors cursor-pointer ${
                            commType === type
                              ? 'bg-white text-[#1A1D24] shadow-2xs'
                              : 'text-[#525866] hover:text-[#1A1D24]'
                          }`}
                        >
                          {type}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <input
                  type="text"
                  value={commTitle}
                  onChange={(e) => setCommTitle(e.target.value)}
                  placeholder={`Subject or summary of ${commType.toLowerCase()} with ${client.name}...`}
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={commSummary}
                    onChange={(e) => setCommSummary(e.target.value)}
                    placeholder="Key takeaways or agreed action items (optional)"
                    className="flex-1 px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!commTitle.trim()}
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] disabled:opacity-45 cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Log entry
                  </button>
                </div>
              </form>

              {/* Timeline List */}
              <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6">
                <h3 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-4">
                  Communication timeline
                </h3>
                <div className="divide-y divide-[#ECEAE4]">
                  {client.timeline.map((entry) => (
                    <div key={entry.id} className="py-4 first:pt-0 last:pb-0 flex gap-3.5">
                      <div className="w-7 h-7 rounded-md bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-[#13233A] shrink-0 mt-0.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="text-[13px] font-semibold text-[#1A1D24]">
                            {entry.title}
                          </div>
                          <div className="text-[11px] tabular-nums text-[#7A808D]">
                            {formatDisplayDate(entry.date)} · {entry.time}
                          </div>
                        </div>
                        <p className="text-xs text-[#525866] mt-1 leading-relaxed">
                          {entry.summary}
                        </p>
                        <div className="text-[11px] text-[#7A808D] mt-1.5">
                          {entry.type} · Logged by {entry.author}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes & Files Preview Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#1A1D24] font-display">
                      Recent notes
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('notes')}
                      className="text-xs font-medium text-[#13233A] hover:underline cursor-pointer"
                    >
                      Manage notes
                    </button>
                  </div>
                  {client.notes.length > 0 ? (
                    <div className="divide-y divide-[#ECEAE4]">
                      {client.notes.slice(0, 2).map((note) => (
                        <div key={note.id} className="py-2.5 first:pt-0 last:pb-0 text-xs">
                          <p className="leading-relaxed text-[#1A1D24]">{note.content}</p>
                          <div className="text-[11px] text-[#7A808D] mt-1 tabular-nums">
                            {note.createdAt}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7A808D]">No notes added yet.</p>
                  )}
                </div>

                <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-[#1A1D24] font-display">
                      Key files
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('files')}
                      className="text-xs font-medium text-[#13233A] hover:underline cursor-pointer"
                    >
                      View all ({client.files.length})
                    </button>
                  </div>
                  {client.files.length > 0 ? (
                    <div className="divide-y divide-[#ECEAE4]">
                      {client.files.slice(0, 3).map((file) => (
                        <div
                          key={file.id}
                          className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-3.5 h-3.5 text-[#7A808D] shrink-0" />
                            <span className="text-xs font-medium text-[#1A1D24] truncate">
                              {file.name}
                            </span>
                          </div>
                          <span className="text-[11px] tabular-nums text-[#7A808D] shrink-0">
                            {file.size}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-[#7A808D]">No files attached yet.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 space-y-5">
              <form onSubmit={handleAddNote} className="space-y-3">
                <label className="block text-xs font-semibold text-[#1A1D24]">
                  Add client note
                </label>
                <textarea
                  rows={3}
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Record meeting context, stakeholder preferences, or renewal signals..."
                  className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none resize-none"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!noteInput.trim()}
                    className="px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] disabled:opacity-45 cursor-pointer"
                  >
                    Save note
                  </button>
                </div>
              </form>

              <div className="divide-y divide-[#ECEAE4]">
                {client.notes.map((note) => (
                  <div
                    key={note.id}
                    className="py-4 first:pt-2 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1.5">
                      <p className="text-[13px] text-[#1A1D24] leading-relaxed">
                        {note.content}
                      </p>
                      <div className="text-[11px] text-[#7A808D] tabular-nums">
                        {note.author} · {note.createdAt}
                        {note.pinned && (
                          <span className="text-[#B4690E] font-medium ml-2">Pinned</span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => togglePinNote(client.id, note.id)}
                      title={note.pinned ? 'Unpin note' : 'Pin note'}
                      className={`p-1.5 rounded-md border transition-colors cursor-pointer shrink-0 ${
                        note.pinned
                          ? 'bg-[#FEF6E9] border-[#F2DEC0] text-[#B4690E]'
                          : 'bg-white border-[#E5E2DC] text-[#7A808D] hover:text-[#1A1D24]'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {client.notes.length === 0 && (
                  <p className="py-8 text-center text-xs text-[#7A808D]">
                    No notes recorded yet. Add your first note above.
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-[15px] font-semibold text-[#1A1D24] font-display">
                    Client files & deliverables
                  </h3>
                  <p className="text-xs text-[#7A808D] mt-0.5">
                    Proposals, signed contracts, invoices, and project files
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddFileForm((v) => !v)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Attach file
                </button>
              </div>

              {showAddFileForm && (
                <form
                  onSubmit={handleAddFile}
                  className="bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg p-4 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end"
                >
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-medium text-[#525866] mb-1">
                      File name
                    </label>
                    <input
                      type="text"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                      placeholder="e.g. Q1_Renewal_Proposal.pdf"
                      className="w-full px-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#525866] mb-1">
                      Category
                    </label>
                    <select
                      value={fileCategory}
                      onChange={(e) => setFileCategory(e.target.value as ClientFile['category'])}
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-md"
                    >
                      <option value="Proposal">Proposal</option>
                      <option value="Contract">Contract</option>
                      <option value="Deliverable">Deliverable</option>
                      <option value="Invoice">Invoice</option>
                      <option value="Brief">Brief</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={fileType}
                      onChange={(e) => setFileType(e.target.value as ClientFile['fileType'])}
                      className="px-2 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-md"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Figma">Figma</option>
                      <option value="DOCX">DOCX</option>
                      <option value="ZIP">ZIP</option>
                    </select>
                    <button
                      type="submit"
                      className="flex-1 px-3 py-1.5 text-xs font-medium bg-[#13233A] text-white rounded-md hover:bg-[#1D3454] cursor-pointer"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}

              <div className="divide-y divide-[#ECEAE4]">
                {client.files.map((file) => (
                  <div
                    key={file.id}
                    className="py-3.5 first:pt-1 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-[#FAF9F6] border border-[#E5E2DC] flex items-center justify-center text-[#13233A] shrink-0">
                        <Paperclip className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-[#1A1D24] truncate">
                          {file.name}
                        </div>
                        <div className="text-xs text-[#525866] mt-0.5">{file.summary}</div>
                        <div className="text-[11px] text-[#7A808D] mt-1 tabular-nums">
                          {file.category} · {file.fileType} · {file.size} · Uploaded{' '}
                          {formatDisplayDate(file.uploadedAt)}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => showToast(`Opened preview for ${file.name}`)}
                      className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-md hover:bg-[#FAF9F6] cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center"
                    >
                      Open file
                    </button>
                  </div>
                ))}
                {client.files.length === 0 && (
                  <p className="py-8 text-center text-xs text-[#7A808D]">
                    No files attached to this client yet.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
