import React, { useMemo, useState } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { TaskItem } from '../types/crm';
import { formatDisplayDate, getTodayISO } from '../utils/format';

export const TasksPage: React.FC = () => {
  const { tasks, clients, addTask, toggleTask, deleteTask, navigateTo } = useCRM();

  const [filter, setFilter] = useState<'All' | 'Today' | 'Overdue' | 'Upcoming' | 'Completed'>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | TaskItem['priority']>('All');

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<TaskItem['category']>('Follow-up');
  const [priority, setPriority] = useState<TaskItem['priority']>('High');
  const todayISO = getTodayISO();
  const [dueDate, setDueDate] = useState(() => getTodayISO());
  const [dueTime, setDueTime] = useState('10:00');
  const [linkedClientId, setLinkedClientId] = useState<string>('');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        if (filter === 'Completed') return t.completed;
        if (filter === 'Today') return !t.completed && t.dueDate === todayISO;
        if (filter === 'Overdue') return !t.completed && t.dueDate < todayISO;
        if (filter === 'Upcoming') return !t.completed && t.dueDate > todayISO;
        return true;
      })
      .filter((t) => priorityFilter === 'All' || t.priority === priorityFilter)
      .sort((a, b) => Number(a.completed) - Number(b.completed) || a.dueDate.localeCompare(b.dueDate));
  }, [tasks, filter, priorityFilter, todayISO]);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const client = clients.find((c) => c.id === linkedClientId);
    addTask({
      title: title.trim(),
      category,
      priority,
      dueDate,
      dueTime,
      linkedType: client ? 'client' : undefined,
      linkedId: client?.id,
      linkedLabel: client?.company,
    });
    setTitle('');
  };

  const priorityColor: Record<TaskItem['priority'], string> = {
    High: 'text-[#B4690E] font-semibold',
    Medium: 'text-[#13233A] font-medium',
    Low: 'text-[#7A808D]',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1D24] font-display">
            Tasks
          </h1>
          <p className="text-[13.5px] text-[#525866] mt-1 tabular-nums">
            {tasks.filter((t) => !t.completed).length} open ·{' '}
            {tasks.filter((t) => !t.completed && t.dueDate < todayISO).length} overdue ·{' '}
            {tasks.filter((t) => t.completed).length} completed
          </p>
        </div>
      </div>

      {/* Quick Add Task Bar */}
      <form
        onSubmit={handleAddTask}
        className="bg-white border border-[#E5E2DC] rounded-[10px] p-4 sm:p-5 grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
      >
        <div className="md:col-span-4">
          <label className="block text-[11px] font-medium text-[#525866] mb-1">
            Task description
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Send Q1 retainer proposal to Meridian..."
            className="w-full px-3 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:bg-white focus:border-[#13233A] focus:outline-none"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-[#525866] mb-1">
            Client (optional)
          </label>
          <select
            value={linkedClientId}
            onChange={(e) => setLinkedClientId(e.target.value)}
            className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
          >
            <option value="">General</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.company}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-[#525866] mb-1">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskItem['category'])}
            className="w-full px-2.5 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
          >
            <option value="Follow-up">Follow-up</option>
            <option value="Deliverable">Deliverable</option>
            <option value="Proposal">Proposal</option>
            <option value="Meeting">Meeting</option>
            <option value="Admin">Admin</option>
          </select>
        </div>

        <div className="md:col-span-1">
          <label className="block text-[11px] font-medium text-[#525866] mb-1">
            Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskItem['priority'])}
            className="w-full px-2 py-2 text-xs bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-[11px] font-medium text-[#525866] mb-1">
            Due date
          </label>
          <div className="flex gap-1.5">
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-2 py-2 text-xs tabular-nums bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none"
            />
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              aria-label="Due time"
              className="w-20 px-1.5 py-2 text-xs tabular-nums bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg focus:border-[#13233A] focus:outline-none hidden sm:block"
            />
          </div>
        </div>

        <div className="md:col-span-1">
          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 text-xs font-medium bg-[#13233A] text-white rounded-lg hover:bg-[#1D3454] cursor-pointer whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 bg-[#EFECE5] p-1 rounded-lg border border-[#E5E2DC]">
          {(['All', 'Today', 'Overdue', 'Upcoming', 'Completed'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                filter === tab
                  ? 'bg-white text-[#1A1D24] shadow-2xs'
                  : 'text-[#525866] hover:text-[#1A1D24]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as typeof priorityFilter)}
          aria-label="Filter by priority"
          className="px-3 py-1.5 text-xs bg-white border border-[#E5E2DC] rounded-lg text-[#1A1D24] focus:border-[#13233A] focus:outline-none cursor-pointer self-start sm:self-auto"
        >
          <option value="All">All priorities</option>
          <option value="High">High priority</option>
          <option value="Medium">Medium priority</option>
          <option value="Low">Low priority</option>
        </select>
      </div>

      {/* Task List */}
      <div className="bg-white border border-[#E5E2DC] rounded-[10px] divide-y divide-[#ECEAE4]">
        {filteredTasks.map((task) => {
          const isOverdue = !task.completed && task.dueDate < todayISO;
          return (
            <div
              key={task.id}
              className="px-4 sm:px-5 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4 hover:bg-[#FAF9F6] transition-colors"
            >
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => toggleTask(task.id)}
                  aria-label={`Toggle ${task.title}`}
                  className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                    task.completed
                      ? 'bg-[#13233A] border-[#13233A] text-white'
                      : 'bg-white border-[#CFCAC0] hover:border-[#13233A]'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3" />}
                </button>

                <div className="min-w-0">
                  <div
                    className={`text-[13.5px] leading-snug ${
                      task.completed
                        ? 'line-through text-[#7A808D]'
                        : 'text-[#1A1D24] font-medium'
                    }`}
                  >
                    {task.title}
                  </div>
                  <div className="text-[11.5px] text-[#7A808D] mt-1 flex flex-wrap items-center gap-2">
                    <span>{task.category}</span>
                    {task.linkedLabel && (
                      <>
                        <span>·</span>
                        <button
                          type="button"
                          onClick={() => {
                            if (task.linkedType === 'client' && task.linkedId) {
                              navigateTo('clients', { clientId: task.linkedId });
                            } else if (task.linkedType === 'lead' && task.linkedId) {
                              navigateTo('leads', { leadId: task.linkedId });
                            } else if (task.linkedType === 'project') {
                              navigateTo('projects');
                            }
                          }}
                          className="text-[#13233A] hover:underline font-medium cursor-pointer"
                        >
                          {task.linkedLabel}
                        </button>
                      </>
                    )}
                    <span>·</span>
                    <span className={priorityColor[task.priority]}>
                      {task.priority} priority
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 pl-7 sm:pl-0 shrink-0">
                <div className="sm:text-right tabular-nums">
                  <div
                    className={`text-xs ${
                      isOverdue ? 'text-[#B4690E] font-semibold' : 'text-[#525866]'
                    }`}
                  >
                    {formatDisplayDate(task.dueDate)}
                  </div>
                  <div className="text-[11px] text-[#7A808D]">
                    {task.dueTime}
                    {isOverdue ? ' · Overdue' : ''}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete task ${task.title}`}
                  className="p-1.5 rounded-md text-[#A8A298] hover:text-red-700 hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-14 px-4 text-center">
            <div className="text-sm font-semibold text-[#1A1D24]">
              No tasks in this view
            </div>
            <p className="text-xs text-[#7A808D] mt-1">
              Add a task above or switch back to all tasks.
            </p>
            {(filter !== 'All' || priorityFilter !== 'All') && (
              <button
                type="button"
                onClick={() => {
                  setFilter('All');
                  setPriorityFilter('All');
                }}
                className="mt-3 px-3.5 py-1.5 text-xs font-medium bg-white border border-[#E5E2DC] rounded-md cursor-pointer"
              >
                Show all tasks
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
