import React, { useState } from 'react';
import { Calendar, Check, Plus } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { formatCurrency, formatShortDate, getInitials } from '../utils/format';
import { RevenueChart } from '../components/charts/RevenueChart';
import { PipelineChart } from '../components/charts/PipelineChart';
import { TODAY_ISO } from '../data/initialData';

export const DashboardPage: React.FC = () => {
  const {
    clients,
    leads,
    projects,
    followUps,
    tasks,
    activities,
    monthlyRevenue,
    settings,
    navigateTo,
    openAddLeadModal,
    openFollowUpModal,
    completeFollowUp,
    toggleTask,
  } = useCRM();

  const [chartRange, setChartRange] = useState<'6m' | '12m'>('6m');

  // Computed KPI values
  const totalClients = clients.length;
  const activeClientsCount = clients.filter((c) => c.status !== 'Past').length;
  const activeProjects = projects.filter((p) => p.status !== 'Completed');
  const dueSoonProjects = activeProjects.filter((p) => p.dueDate <= '2026-12-05').length;

  const openLeads = leads.filter((l) => l.stage !== 'Won' && l.stage !== 'Lost');
  const pipelineValue = openLeads.reduce((sum, l) => sum + l.value, 0);

  const currentMonth = monthlyRevenue[monthlyRevenue.length - 1];
  const prevMonth = monthlyRevenue[monthlyRevenue.length - 2];
  const monthlyGrowthPct =
    prevMonth && prevMonth.revenue > 0
      ? Math.round(((currentMonth.revenue - prevMonth.revenue) / prevMonth.revenue) * 100)
      : 0;

  const pendingFollowUps = followUps
    .filter((f) => !f.completed)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));

  const dueTodayFollowUpsCount = pendingFollowUps.filter((f) => f.date <= TODAY_ISO).length;
  const openTasks = tasks.filter((t) => !t.completed);
  const dueTodayTasksCount = openTasks.filter((t) => t.dueDate <= TODAY_ISO).length;

  const firstName = settings.ownerName.split(' ')[0] || 'Oluwafemi';

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-[#1A1D24] font-display leading-tight">
            Good morning, {firstName}
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1">
            Wednesday, 25 November ·{' '}
            <span className="font-medium text-[#1A1D24] tabular-nums">
              {dueTodayFollowUpsCount} follow-up{dueTodayFollowUpsCount === 1 ? '' : 's'}
            </span>{' '}
            and{' '}
            <span className="font-medium text-[#1A1D24] tabular-nums">
              {dueTodayTasksCount} task{dueTodayTasksCount === 1 ? '' : 's'}
            </span>{' '}
            due today
          </p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('reports')}
            className="px-3.5 py-2 text-xs font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-lg hover:bg-[#FAF9F6] hover:border-[#CFCAC0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            View reports
          </button>
          <button
            type="button"
            onClick={openAddLeadModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Lead
          </button>
        </div>
      </div>

      {/* Unified 5-Metric Executive KPI Bar with crisp 375px & desktop border math */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] overflow-hidden">
        <div className="grid grid-cols-2 lg:grid-cols-5 -mr-px -mb-px">
          <button
            type="button"
            onClick={() => navigateTo('clients')}
            className="p-4 sm:p-5 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer border-r border-b border-[#ECEAE4]"
          >
            <div className="text-xs font-medium text-[#525866]">Total clients</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display tabular-nums mt-1.5">
              {totalClients}
            </div>
            <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums">
              {activeClientsCount} active or retainer
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('projects')}
            className="p-4 sm:p-5 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer border-r border-b border-[#ECEAE4]"
          >
            <div className="text-xs font-medium text-[#525866]">Active projects</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display tabular-nums mt-1.5">
              {activeProjects.length}
            </div>
            <div className="text-[11.5px] text-[#B4690E] mt-1 tabular-nums">
              {dueSoonProjects} due within 10 days
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('leads')}
            className="p-4 sm:p-5 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer border-r border-b border-[#ECEAE4]"
          >
            <div className="text-xs font-medium text-[#525866]">Open leads</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display tabular-nums mt-1.5">
              {openLeads.length}
            </div>
            <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums">
              {leads.filter((l) => l.stage === 'Negotiation').length} in negotiation
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('leads')}
            className="p-4 sm:p-5 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer border-r border-b border-[#ECEAE4]"
          >
            <div className="text-xs font-medium text-[#525866]">Pipeline value</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display tabular-nums mt-1.5">
              {formatCurrency(pipelineValue, settings.currency, true)}
            </div>
            <div className="text-[11.5px] text-[#7A808D] mt-1 tabular-nums truncate">
              {formatCurrency(pipelineValue, settings.currency)} total open
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigateTo('reports')}
            className="p-4 sm:p-5 text-left hover:bg-[#FAF9F6] transition-colors cursor-pointer border-r border-b border-[#ECEAE4] col-span-2 lg:col-span-1"
          >
            <div className="text-xs font-medium text-[#525866]">Monthly revenue</div>
            <div className="text-xl sm:text-2xl font-bold text-[#1A1D24] font-display tabular-nums mt-1.5">
              {formatCurrency(currentMonth.revenue, settings.currency, true)}
            </div>
            <div className="text-[11.5px] text-emerald-700 mt-1 tabular-nums">
              {monthlyGrowthPct >= 0 ? `+${monthlyGrowthPct}%` : `${monthlyGrowthPct}%`} vs October
            </div>
          </button>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7">
          <RevenueChart
            data={monthlyRevenue}
            currency={settings.currency}
            range={chartRange}
            onRangeChange={setChartRange}
          />
        </div>
        <div className="lg:col-span-5">
          <PipelineChart
            leads={leads}
            currency={settings.currency}
            onSelectStage={(stage) => navigateTo('leads', { stageFilter: stage })}
          />
        </div>
      </div>

      {/* Operational Row: Upcoming Follow-ups, Upcoming Tasks, Recent Client Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">
        {/* Upcoming Follow-ups */}
        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
              Upcoming follow-ups
            </h2>
            <span className="text-xs text-[#7A808D] tabular-nums">
              {pendingFollowUps.length} scheduled
            </span>
          </div>

          <div className="divide-y divide-[#ECEAE4] flex-1">
            {pendingFollowUps.slice(0, 4).map((fu) => {
              const isToday = fu.date <= TODAY_ISO;

              return (
                <div
                  key={fu.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => completeFollowUp(fu.id)}
                      title="Mark follow-up completed"
                      className="w-8 h-8 rounded-full bg-[#F3F1EC] border border-[#E5E2DC] flex items-center justify-center text-[11px] font-semibold text-[#13233A] shrink-0 hover:bg-[#13233A] hover:text-white hover:border-[#13233A] transition-colors cursor-pointer"
                    >
                      {getInitials(fu.contactName)}
                    </button>
                    <div className="min-w-0">
                      <button
                        type="button"
                        onClick={() => {
                          if (fu.targetType === 'client') {
                            navigateTo('clients', { clientId: fu.targetId });
                          } else {
                            navigateTo('leads', { leadId: fu.targetId });
                          }
                        }}
                        className="text-[13px] font-medium text-[#1A1D24] hover:text-[#13233A] hover:underline truncate block text-left cursor-pointer"
                      >
                        {fu.contactName}
                      </button>
                      <div className="text-[11.5px] text-[#7A808D] truncate">
                        {fu.company} ·{' '}
                        <span className={isToday ? 'text-[#B4690E] font-medium tabular-nums' : 'tabular-nums'}>
                          {isToday ? 'Today' : formatShortDate(fu.date)} {fu.time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openFollowUpModal({
                        targetType: fu.targetType,
                        targetId: fu.targetId,
                        contactName: fu.contactName,
                        company: fu.company,
                      })
                    }
                    className="px-2.5 py-1.5 text-[11.5px] font-medium bg-white border border-[#E5E2DC] text-[#1A1D24] rounded-md hover:bg-[#FAF9F6] hover:border-[#CFCAC0] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                  >
                    Schedule
                  </button>
                </div>
              );
            })}
            {pendingFollowUps.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-xs font-medium text-[#1A1D24]">
                  No pending follow-ups
                </p>
                <p className="text-[11.5px] text-[#7A808D] mt-1">
                  Open any client profile or lead to schedule your next check-in.
                </p>
                <button
                  type="button"
                  onClick={() => navigateTo('clients')}
                  className="mt-3 px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Browse clients
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
              Upcoming tasks
            </h2>
            <button
              type="button"
              onClick={() => navigateTo('tasks')}
              className="text-xs font-medium text-[#525866] hover:text-[#13233A] cursor-pointer"
            >
              View all
            </button>
          </div>

          <div className="divide-y divide-[#ECEAE4] flex-1">
            {tasks.slice(0, 5).map((task) => {
              const isOverdue = !task.completed && task.dueDate < TODAY_ISO;
              return (
                <div
                  key={task.id}
                  className="py-3 first:pt-0 last:pb-0 flex items-start gap-3"
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    aria-label={`Toggle task ${task.title}`}
                    className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                      task.completed
                        ? 'bg-[#13233A] border-[#13233A] text-white'
                        : 'bg-white border-[#CFCAC0] hover:border-[#13233A]'
                    }`}
                  >
                    {task.completed && <Check className="w-3 h-3" />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[13px] leading-snug ${
                        task.completed
                          ? 'line-through text-[#7A808D]'
                          : 'text-[#1A1D24] font-medium'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="text-[11.5px] text-[#7A808D] mt-0.5 flex items-center gap-1.5 tabular-nums">
                      <span>{task.category}</span>
                      <span>·</span>
                      <span className={isOverdue ? 'text-[#B4690E] font-medium' : ''}>
                        {formatShortDate(task.dueDate)} · {task.dueTime}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="py-10 text-center">
                <p className="text-xs font-medium text-[#1A1D24]">No tasks yet</p>
                <button
                  type="button"
                  onClick={() => navigateTo('tasks')}
                  className="mt-3 px-3 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                >
                  Create task
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Client Activity */}
        <div className="bg-white border border-[#E5E2DC] rounded-[10px] p-5 sm:p-6 flex flex-col">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h2 className="text-[15px] font-semibold text-[#1A1D24] font-display">
              Recent client activity
            </h2>
            <Calendar className="w-4 h-4 text-[#7A808D]" aria-hidden="true" />
          </div>

          <div className="divide-y divide-[#ECEAE4] flex-1">
            {activities.slice(0, 5).map((act) => (
              <div key={act.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (act.targetSection) {
                        navigateTo(act.targetSection, {
                          clientId:
                            act.targetSection === 'clients' ? act.targetId ?? null : null,
                          leadId: act.targetSection === 'leads' ? act.targetId ?? null : null,
                        });
                      }
                    }}
                    className="text-[13px] font-medium text-[#1A1D24] hover:text-[#13233A] hover:underline text-left cursor-pointer"
                  >
                    {act.title}
                  </button>
                  <span className="text-[11px] text-[#7A808D] whitespace-nowrap shrink-0 tabular-nums">
                    {act.timestampLabel}
                  </span>
                </div>
                <p className="text-[12px] text-[#525866] mt-0.5 leading-snug">
                  {act.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
