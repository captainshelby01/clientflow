import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { CurrencyCode } from '../types/crm';
import { getInitials } from '../utils/format';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, resetDemoData } = useCRM();

  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [ownerRole, setOwnerRole] = useState(settings.ownerRole);
  const [ownerEmail, setOwnerEmail] = useState(settings.ownerEmail);
  const [workspaceName, setWorkspaceName] = useState(settings.workspaceName);
  const [currency, setCurrency] = useState<CurrencyCode>(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [defaultFollowUpDays, setDefaultFollowUpDays] = useState(settings.defaultFollowUpDays);
  const [monthlyRevenueTarget, setMonthlyRevenueTarget] = useState(settings.monthlyRevenueTarget);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      ownerName: ownerName.trim() || 'Alex Okafor',
      ownerInitials: getInitials(ownerName.trim() || 'Alex Okafor'),
      ownerRole: ownerRole.trim() || 'Principal Consultant',
      ownerEmail: ownerEmail.trim() || 'alex@alexstudio.co',
      workspaceName: workspaceName.trim() || 'Alex Studio',
      currency,
      timezone,
      defaultFollowUpDays: Math.max(1, Number(defaultFollowUpDays) || 3),
      monthlyRevenueTarget: Math.max(1000, Number(monthlyRevenueTarget) || 24000),
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-[#1A1D24] tracking-tight font-display">
          Settings
        </h1>
        <p className="text-[13.5px] text-[#525866] mt-0.5">
          Manage your studio workspace profile, currency display, follow-up cadence, and notifications.
        </p>
      </div>

      {/* Workspace & Currency Form */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white border border-[#E5E2DC] rounded-[10px] p-6 space-y-5"
      >
        <div className="pb-4 border-b border-[#ECEAE4]">
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
            Workspace & Profile
          </h2>
          <p className="text-xs text-[#7A808D] mt-0.5">
            Changes update across your dashboard greeting, reports, and currency displays.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Your Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Role / Title
            </label>
            <input
              type="text"
              value={ownerRole}
              onChange={(e) => setOwnerRole(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Studio / Workspace Name
            </label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Work Email
            </label>
            <input
              type="email"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Display Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none cursor-pointer"
            >
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
              <option value="EUR">EUR (€)</option>
              <option value="NGN">NGN (₦)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Timezone
            </label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none cursor-pointer"
            >
              <option value="GMT+0 (London)">GMT+0 (London)</option>
              <option value="EST (New York)">EST (New York)</option>
              <option value="PST (San Francisco)">PST (San Francisco)</option>
              <option value="CET (Berlin / Paris)">CET (Berlin / Paris)</option>
              <option value="WAT (Lagos)">WAT (Lagos)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Follow-up Cadence (days)
            </label>
            <input
              type="number"
              min={1}
              max={30}
              value={defaultFollowUpDays}
              onChange={(e) => setDefaultFollowUpDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#525866] mb-1">
              Monthly Goal (USD)
            </label>
            <input
              type="number"
              min={1000}
              step={500}
              value={monthlyRevenueTarget}
              onChange={(e) => setMonthlyRevenueTarget(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono tabular-nums bg-white border border-[#E5E2DC] rounded-md focus:border-[#13233A] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-[#ECEAE4] flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-md hover:bg-[#1D3454] cursor-pointer"
          >
            Save Workspace Settings
          </button>
        </div>
      </form>

      {/* Notification Preferences */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-6">
        <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display mb-1">
          Reminders & Notifications
        </h2>
        <p className="text-xs text-[#7A808D] mb-4">
          Control how ClientFlow alerts you about client follow-ups and proposals.
        </p>

        <div className="divide-y divide-[#ECEAE4]">
          {[
            {
              key: 'dailyFollowUpDigest' as const,
              title: 'Daily follow-up summary',
              desc: 'Morning digest listing client calls and follow-ups due that day.',
            },
            {
              key: 'proposalViewedAlerts' as const,
              title: 'Proposal viewed alerts',
              desc: 'Notify when a prospective client opens a shared proposal PDF.',
            },
            {
              key: 'overdueTaskAlerts' as const,
              title: 'Overdue deliverable reminders',
              desc: 'Highlight tasks and milestones past their scheduled due date.',
            },
            {
              key: 'invoicePaidAlerts' as const,
              title: 'Invoice payment confirmations',
              desc: 'Log timeline confirmation when milestone or retainer invoices clear.',
            },
          ].map((item) => {
            const enabled = settings.notifications[item.key];
            return (
              <div
                key={item.key}
                className="py-3.5 first:pt-1 last:pb-0 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="text-[13px] font-medium text-[#1A1D24]">{item.title}</div>
                  <div className="text-xs text-[#7A808D] mt-0.5">{item.desc}</div>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  onClick={() =>
                    updateSettings({
                      notifications: {
                        ...settings.notifications,
                        [item.key]: !enabled,
                      },
                    })
                  }
                  className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
                    enabled ? 'bg-[#13233A]' : 'bg-[#D5D0C6]'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      enabled ? 'translate-x-4.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Data Reset */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
            Sample Workspace Data
          </h2>
          <p className="text-xs text-[#7A808D] mt-0.5">
            Restore ClientFlow to its original curated demo clients, leads, and projects.
          </p>
        </div>

        {!confirmReset ? (
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-md hover:bg-[#F3F1EC] cursor-pointer whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Demo Data
          </button>
        ) : (
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setConfirmReset(false)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] text-[#525866] rounded-md cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                setConfirmReset(false);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-red-700 text-white rounded-md hover:bg-red-800 cursor-pointer"
            >
              Confirm Reset
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
