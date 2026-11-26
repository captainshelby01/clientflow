import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  INITIAL_ACTIVITIES,
  INITIAL_CLIENTS,
  INITIAL_FOLLOWUPS,
  INITIAL_LEADS,
  INITIAL_MONTHLY_REVENUE,
  INITIAL_NOTIFICATIONS,
  INITIAL_PROJECTS,
  INITIAL_SETTINGS,
  INITIAL_TASKS,
} from '../data/initialData';
import { addDaysISO, getCurrentTimeHHMM, getTodayISO } from '../utils/format';
import { buildUrlFromRoute, parseRouteFromLocation, RouteState } from '../utils/routing';
import {
  ActivityItem,
  Client,
  ClientFile,
  CommunicationEntry,
  FollowUp,
  Lead,
  LeadStage,
  MonthlyRevenuePoint,
  NavSection,
  NotificationItem,
  Project,
  TaskItem,
  WorkspaceSettings,
} from '../types/crm';

interface PersistedState {
  clients: Client[];
  leads: Lead[];
  projects: Project[];
  followUps: FollowUp[];
  tasks: TaskItem[];
  activities: ActivityItem[];
  monthlyRevenue: MonthlyRevenuePoint[];
  notifications: NotificationItem[];
  settings: WorkspaceSettings;
}

const STORAGE_KEY = 'clientflow_crm_state_v2';

function loadInitialState(): PersistedState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (parsed && Array.isArray(parsed.clients) && Array.isArray(parsed.leads)) {
        return {
          clients: parsed.clients,
          leads: parsed.leads,
          projects: parsed.projects || INITIAL_PROJECTS,
          followUps: parsed.followUps || INITIAL_FOLLOWUPS,
          tasks: parsed.tasks || INITIAL_TASKS,
          activities: parsed.activities || INITIAL_ACTIVITIES,
          monthlyRevenue: parsed.monthlyRevenue || INITIAL_MONTHLY_REVENUE,
          notifications: parsed.notifications || INITIAL_NOTIFICATIONS,
          settings: parsed.settings || INITIAL_SETTINGS,
        };
      }
    }
  } catch {
    // Ignore storage parse error and fall back to defaults
  }
  return {
    clients: INITIAL_CLIENTS,
    leads: INITIAL_LEADS,
    projects: INITIAL_PROJECTS,
    followUps: INITIAL_FOLLOWUPS,
    tasks: INITIAL_TASKS,
    activities: INITIAL_ACTIVITIES,
    monthlyRevenue: INITIAL_MONTHLY_REVENUE,
    notifications: INITIAL_NOTIFICATIONS,
    settings: INITIAL_SETTINGS,
  };
}

export interface ScheduleFollowUpTarget {
  targetType: 'client' | 'lead';
  targetId: string;
  contactName: string;
  company: string;
}

export interface AIDraftTarget {
  targetType: 'client' | 'lead';
  targetId: string;
  initialMode?: 'follow_up' | 'proposal';
  recipientName: string;
  recipientRole: string;
  company: string;
  industry: string;
  scope: string;
  dealValue: number;
  stageOrStatus: string;
  recentContext: string;
}

interface CRMContextValue extends PersistedState {
  activeSection: NavSection;
  selectedClientId: string | null;
  selectedLeadId: string | null;
  leadStageFilter: LeadStage | 'All';
  isAddLeadOpen: boolean;
  isAddClientOpen: boolean;
  isAboutOpen: boolean;
  followUpModalTarget: ScheduleFollowUpTarget | null;
  aiDraftTarget: AIDraftTarget | null;
  toastMessage: string | null;

  navigateTo: (
    section: NavSection,
    options?: { clientId?: string | null; leadId?: string | null; stageFilter?: LeadStage | 'All' }
  ) => void;
  setSelectedClientId: (id: string | null) => void;
  setSelectedLeadId: (id: string | null) => void;
  setLeadStageFilter: (stage: LeadStage | 'All') => void;
  openAddLeadModal: () => void;
  closeAddLeadModal: () => void;
  openAddClientModal: () => void;
  closeAddClientModal: () => void;
  openAboutModal: () => void;
  closeAboutModal: () => void;
  openFollowUpModal: (target: ScheduleFollowUpTarget) => void;
  closeFollowUpModal: () => void;
  openAIDraftModal: (target: AIDraftTarget) => void;
  closeAIDraftModal: () => void;
  showToast: (msg: string) => void;

  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLead: (id: string, patch: Partial<Lead>) => void;
  moveLeadStage: (id: string, newStage: LeadStage) => void;
  convertLeadToClient: (leadId: string) => string | null;
  deleteLead: (id: string) => void;

  addClient: (client: Omit<Client, 'id' | 'notes' | 'files' | 'timeline'>) => string;
  updateClient: (id: string, patch: Partial<Client>) => void;
  addClientNote: (clientId: string, content: string, pinned?: boolean) => void;
  togglePinNote: (clientId: string, noteId: string) => void;
  addClientFile: (clientId: string, file: Omit<ClientFile, 'id' | 'uploadedAt' | 'uploadedBy'>) => void;
  logCommunication: (clientId: string, entry: Omit<CommunicationEntry, 'id' | 'author'>) => void;

  scheduleFollowUp: (input: Omit<FollowUp, 'id' | 'completed'>) => void;
  completeFollowUp: (followUpId: string) => void;

  addProject: (project: Omit<Project, 'id' | 'milestones'> & { milestones?: Project['milestones'] }) => void;
  updateProjectStatus: (projectId: string, status: Project['status']) => void;
  toggleMilestone: (projectId: string, milestoneId: string) => void;

  addTask: (task: Omit<TaskItem, 'id' | 'completed'>) => void;
  toggleTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;

  updateSettings: (patch: Partial<WorkspaceSettings>) => void;
  markAllNotificationsRead: () => void;
  resetDemoData: () => void;
}

const CRMContext = createContext<CRMContextValue | null>(null);

export const CRMProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const initialRoute =
    typeof window !== 'undefined'
      ? parseRouteFromLocation(window.location.pathname, window.location.search)
      : { section: 'dashboard' as NavSection, clientId: null, leadId: null, stageFilter: 'All' as const };

  const [activeSection, setActiveSection] = useState<NavSection>(initialRoute.section);
  const [selectedClientId, setSelectedClientIdState] = useState<string | null>(initialRoute.clientId);
  const [selectedLeadId, setSelectedLeadIdState] = useState<string | null>(initialRoute.leadId);
  const [leadStageFilter, setLeadStageFilterState] = useState<LeadStage | 'All'>(initialRoute.stageFilter);
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [followUpModalTarget, setFollowUpModalTarget] = useState<ScheduleFollowUpTarget | null>(null);
  const [aiDraftTarget, setAIDraftTarget] = useState<AIDraftTarget | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  useEffect(() => {
    const handlePopState = () => {
      const next = parseRouteFromLocation(window.location.pathname, window.location.search);
      setActiveSection(next.section);
      setSelectedClientIdState(next.clientId);
      setSelectedLeadIdState(next.leadId);
      setLeadStageFilterState(next.stageFilter);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3200);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const syncUrl = (nextRoute: RouteState, replace = false) => {
    if (typeof window === 'undefined') return;
    const nextUrl = buildUrlFromRoute(nextRoute);
    const currentUrl = `${window.location.pathname}${window.location.search}`;
    if (nextUrl !== currentUrl) {
      if (replace) {
        window.history.replaceState(null, '', nextUrl);
      } else {
        window.history.pushState(null, '', nextUrl);
      }
    }
  };

  const navigateTo = (
    section: NavSection,
    options?: { clientId?: string | null; leadId?: string | null; stageFilter?: LeadStage | 'All' }
  ) => {
    const nextClientId =
      options && 'clientId' in options
        ? options.clientId ?? null
        : section !== 'clients'
          ? null
          : selectedClientId;

    const nextLeadId =
      options && 'leadId' in options
        ? options.leadId ?? null
        : section !== 'leads'
          ? null
          : selectedLeadId;

    const nextStageFilter =
      options?.stageFilter ?? (section === 'leads' ? 'All' : leadStageFilter);

    setActiveSection(section);
    setSelectedClientIdState(nextClientId);
    setSelectedLeadIdState(nextLeadId);
    setLeadStageFilterState(nextStageFilter);

    syncUrl({
      section,
      clientId: nextClientId,
      leadId: nextLeadId,
      stageFilter: nextStageFilter,
    });
  };

  const setSelectedClientId = (id: string | null) => {
    setSelectedClientIdState(id);
    if (activeSection === 'clients') {
      syncUrl({
        section: 'clients',
        clientId: id,
        leadId: null,
        stageFilter: leadStageFilter,
      });
    }
  };

  const setSelectedLeadId = (id: string | null) => {
    setSelectedLeadIdState(id);
    if (activeSection === 'leads') {
      syncUrl(
        {
          section: 'leads',
          clientId: null,
          leadId: id,
          stageFilter: leadStageFilter,
        },
        true
      );
    }
  };

  const setLeadStageFilter = (stage: LeadStage | 'All') => {
    setLeadStageFilterState(stage);
    if (activeSection === 'leads') {
      syncUrl(
        {
          section: 'leads',
          clientId: null,
          leadId: selectedLeadId,
          stageFilter: stage,
        },
        true
      );
    }
  };

  const pushActivity = (
    prev: PersistedState,
    item: Omit<ActivityItem, 'id'>
  ): ActivityItem[] => {
    const newItem: ActivityItem = { ...item, id: `act-${Date.now()}` };
    return [newItem, ...prev.activities].slice(0, 14);
  };

  const addLead = (leadData: Omit<Lead, 'id' | 'createdAt'>) => {
    const newId = `lead-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: newId,
      createdAt: getTodayISO(),
    };
    setState((prev) => ({
      ...prev,
      leads: [newLead, ...prev.leads],
      activities: pushActivity(prev, {
        category: 'Lead',
        title: 'Lead added',
        description: `${newLead.name} from ${newLead.company}`,
        timestampLabel: 'Just now',
        targetSection: 'leads',
        targetId: newId,
      }),
    }));
    showToast(`Added lead: ${newLead.name} (${newLead.company})`);
  };

  const updateLead = (id: string, patch: Partial<Lead>) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)),
    }));
  };

  const moveLeadStage = (id: string, newStage: LeadStage) => {
    const stageProbabilities: Record<LeadStage, number> = {
      'New Lead': 20,
      Contacted: 35,
      'Proposal Sent': 60,
      Negotiation: 80,
      Won: 100,
      Lost: 0,
    };

    setState((prev) => {
      const target = prev.leads.find((l) => l.id === id);
      if (!target || target.stage === newStage) return prev;
      return {
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === id
            ? { ...l, stage: newStage, probability: stageProbabilities[newStage] }
            : l
        ),
        activities: pushActivity(prev, {
          category: 'Lead',
          title: `Lead moved to ${newStage}`,
          description: `${target.name} · ${target.company}`,
          timestampLabel: 'Just now',
          targetSection: 'leads',
          targetId: id,
        }),
      };
    });
  };

  const convertLeadToClient = (leadId: string): string | null => {
    const lead = state.leads.find((l) => l.id === leadId);
    if (!lead) return null;
    if (lead.convertedClientId) {
      return lead.convertedClientId;
    }

    const existingCompanyClient = state.clients.find(
      (c) => c.company.toLowerCase() === lead.company.toLowerCase()
    );
    if (existingCompanyClient) {
      setState((prev) => ({
        ...prev,
        leads: prev.leads.map((l) =>
          l.id === leadId
            ? { ...l, stage: 'Won', probability: 100, convertedClientId: existingCompanyClient.id }
            : l
        ),
      }));
      showToast(`Linked ${lead.name} to ${existingCompanyClient.company}`);
      return existingCompanyClient.id;
    }

    const today = getTodayISO();
    const currentTime = getCurrentTimeHHMM();
    const newClientId = `cli-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: lead.name,
      role: lead.role,
      company: lead.company,
      industry: lead.industry,
      email: lead.email,
      phone: lead.phone,
      website: `${lead.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      location: 'Remote',
      timezone: state.settings.timezone.split(' ')[0] || 'GMT+0',
      billingTerms: 'Net 15 · 50% upfront',
      preferredChannel: 'Video Call',
      status: 'Onboarding',
      lastContactDate: today,
      totalValue: lead.value,
      tags: [lead.serviceScope.split(' ')[0] || 'Advisory'],
      notes: lead.notes
        ? [
            {
              id: `note-${Date.now()}`,
              content: lead.notes,
              author: state.settings.ownerName,
              createdAt: `${today} · Converted from lead`,
              pinned: true,
            },
          ]
        : [],
      files: [],
      timeline: [
        {
          id: `comm-${Date.now()}`,
          type: 'Proposal',
          title: 'Converted from Won deal',
          summary: `${lead.serviceScope} signed and moved into client onboarding.`,
          date: today,
          time: currentTime,
          author: state.settings.ownerName,
        },
      ],
    };

    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title: lead.serviceScope,
      clientId: newClientId,
      clientName: lead.name,
      company: lead.company,
      status: 'Planning',
      phase: 'Kickoff & Discovery',
      budget: lead.value,
      billed: Math.round(lead.value * 0.5),
      startDate: today,
      dueDate: lead.expectedCloseDate || addDaysISO(45),
      progress: 10,
      summary: `Initial engagement converted from ${lead.source} pipeline deal.`,
      deliverables: ['Discovery Brief', 'Core Deliverables'],
      milestones: [
        { id: `ms-${Date.now()}-1`, title: 'Kickoff & asset collection', dueDate: today, completed: false },
      ],
    };

    setState((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
      projects: [newProject, ...prev.projects],
      leads: prev.leads.map((l) =>
        l.id === leadId ? { ...l, stage: 'Won', probability: 100, convertedClientId: newClientId } : l
      ),
      activities: pushActivity(prev, {
        category: 'Client',
        title: 'Client onboarded',
        description: `${lead.company} converted from Won deal`,
        timestampLabel: 'Just now',
        targetSection: 'clients',
        targetId: newClientId,
      }),
    }));
    showToast(`${lead.company} converted to active client`);
    return newClientId;
  };

  const deleteLead = (id: string) => {
    setState((prev) => ({
      ...prev,
      leads: prev.leads.filter((l) => l.id !== id),
    }));
    if (selectedLeadId === id) setSelectedLeadId(null);
    showToast('Lead removed');
  };

  const addClient = (clientData: Omit<Client, 'id' | 'notes' | 'files' | 'timeline'>): string => {
    const newId = `cli-${Date.now()}`;
    const today = getTodayISO();
    const newClient: Client = {
      ...clientData,
      id: newId,
      notes: [],
      files: [],
      timeline: [
        {
          id: `comm-${Date.now()}`,
          type: 'Note',
          title: 'Client profile created',
          summary: `Added ${clientData.name} (${clientData.company}) to ClientFlow.`,
          date: today,
          time: getCurrentTimeHHMM(),
          author: state.settings.ownerName,
        },
      ],
    };
    setState((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
      activities: pushActivity(prev, {
        category: 'Client',
        title: 'Client added',
        description: `${clientData.name} · ${clientData.company}`,
        timestampLabel: 'Just now',
        targetSection: 'clients',
        targetId: newId,
      }),
    }));
    showToast(`Added client: ${clientData.company}`);
    return newId;
  };

  const updateClient = (id: string, patch: Partial<Client>) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  };

  const addClientNote = (clientId: string, content: string, pinned = false) => {
    const today = getTodayISO();
    const timeStr = getCurrentTimeHHMM();
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              notes: [
                {
                  id: `note-${Date.now()}`,
                  content,
                  author: prev.settings.ownerName,
                  createdAt: `${today} · ${timeStr}`,
                  pinned,
                },
                ...c.notes,
              ],
            }
          : c
      ),
    }));
    showToast('Note saved to client profile');
  };

  const togglePinNote = (clientId: string, noteId: string) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              notes: c.notes.map((n) => (n.id === noteId ? { ...n, pinned: !n.pinned } : n)),
            }
          : c
      ),
    }));
  };

  const addClientFile = (
    clientId: string,
    file: Omit<ClientFile, 'id' | 'uploadedAt' | 'uploadedBy'>
  ) => {
    const today = getTodayISO();
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              files: [
                {
                  ...file,
                  id: `file-${Date.now()}`,
                  uploadedAt: today,
                  uploadedBy: prev.settings.ownerName,
                },
                ...c.files,
              ],
            }
          : c
      ),
    }));
    showToast(`Attached ${file.name}`);
  };

  const logCommunication = (
    clientId: string,
    entry: Omit<CommunicationEntry, 'id' | 'author'>
  ) => {
    const today = getTodayISO();
    setState((prev) => {
      const client = prev.clients.find((c) => c.id === clientId);
      return {
        ...prev,
        clients: prev.clients.map((c) =>
          c.id === clientId
            ? {
                ...c,
                lastContactDate: entry.date || today,
                timeline: [
                  {
                    ...entry,
                    id: `comm-${Date.now()}`,
                    author: prev.settings.ownerName,
                  },
                  ...c.timeline,
                ],
              }
            : c
        ),
        activities: pushActivity(prev, {
          category: 'Follow-up',
          title: `${entry.type} logged`,
          description: `${client?.company ?? 'Client'} — ${entry.title}`,
          timestampLabel: 'Just now',
          targetSection: 'clients',
          targetId: clientId,
        }),
      };
    });
    showToast('Communication logged');
  };

  const scheduleFollowUp = (input: Omit<FollowUp, 'id' | 'completed'>) => {
    const newFollowUp: FollowUp = {
      ...input,
      id: `fu-${Date.now()}`,
      completed: false,
    };
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      title: `Follow-up (${input.channel}): ${input.contactName} — ${input.agenda}`,
      category: 'Follow-up',
      priority: 'High',
      dueDate: input.date,
      dueTime: input.time,
      completed: false,
      linkedType: input.targetType,
      linkedId: input.targetId,
      linkedLabel: input.company,
    };

    const today = getTodayISO();
    setState((prev) => {
      const updatedClients =
        input.targetType === 'client'
          ? prev.clients.map((c) =>
              c.id === input.targetId
                ? {
                    ...c,
                    timeline: [
                      {
                        id: `comm-${Date.now()}`,
                        type: 'Meeting' as const,
                        title: `Scheduled ${input.channel.toLowerCase()} follow-up`,
                        summary: `${input.date} at ${input.time} · ${input.agenda}`,
                        date: today,
                        time: getCurrentTimeHHMM(),
                        author: prev.settings.ownerName,
                      },
                      ...c.timeline,
                    ],
                  }
                : c
            )
          : prev.clients;

      const updatedLeads =
        input.targetType === 'lead'
          ? prev.leads.map((l) =>
              l.id === input.targetId ? { ...l, nextFollowUpDate: input.date } : l
            )
          : prev.leads;

      return {
        ...prev,
        followUps: [newFollowUp, ...prev.followUps],
        tasks: [newTask, ...prev.tasks],
        clients: updatedClients,
        leads: updatedLeads,
        activities: pushActivity(prev, {
          category: 'Follow-up',
          title: 'Follow-up scheduled',
          description: `${input.contactName} (${input.company}) · ${input.date} ${input.time}`,
          timestampLabel: 'Just now',
          targetSection: input.targetType === 'client' ? 'clients' : 'leads',
          targetId: input.targetId,
        }),
      };
    });

    showToast(`Follow-up scheduled with ${input.contactName}`);
  };

  const completeFollowUp = (followUpId: string) => {
    const today = getTodayISO();
    setState((prev) => {
      const target = prev.followUps.find((f) => f.id === followUpId);
      return {
        ...prev,
        followUps: prev.followUps.map((f) =>
          f.id === followUpId ? { ...f, completed: !f.completed } : f
        ),
        clients:
          target && target.targetType === 'client' && !target.completed
            ? prev.clients.map((c) =>
                c.id === target.targetId ? { ...c, lastContactDate: today } : c
              )
            : prev.clients,
      };
    });
    showToast('Follow-up status updated');
  };

  const addProject = (
    projectData: Omit<Project, 'id' | 'milestones'> & { milestones?: Project['milestones'] }
  ) => {
    const newProject: Project = {
      ...projectData,
      id: `proj-${Date.now()}`,
      milestones: projectData.milestones || [
        { id: `ms-${Date.now()}-1`, title: 'Project kickoff & alignment', dueDate: projectData.startDate, completed: false },
        { id: `ms-${Date.now()}-2`, title: 'Final deliverable sign-off', dueDate: projectData.dueDate, completed: false },
      ],
    };
    setState((prev) => ({
      ...prev,
      projects: [newProject, ...prev.projects],
      activities: pushActivity(prev, {
        category: 'Project',
        title: 'Project created',
        description: `${newProject.title} · ${newProject.company}`,
        timestampLabel: 'Just now',
        targetSection: 'projects',
        targetId: newProject.id,
      }),
    }));
    showToast(`Project created: ${newProject.title}`);
  };

  const updateProjectStatus = (projectId: string, status: Project['status']) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              status,
              progress: status === 'Completed' ? 100 : p.progress,
            }
          : p
      ),
    }));
    showToast(`Project updated to ${status}`);
  };

  const toggleMilestone = (projectId: string, milestoneId: string) => {
    setState((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => {
        if (p.id !== projectId) return p;
        const milestones = p.milestones.map((m) =>
          m.id === milestoneId ? { ...m, completed: !m.completed } : m
        );
        const completedCount = milestones.filter((m) => m.completed).length;
        const progress =
          milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : p.progress;
        return {
          ...p,
          milestones,
          progress,
          status: progress === 100 ? 'Completed' : p.status === 'Completed' ? 'Review' : p.status,
        };
      }),
    }));
  };

  const addTask = (taskData: Omit<TaskItem, 'id' | 'completed'>) => {
    const newTask: TaskItem = {
      ...taskData,
      id: `task-${Date.now()}`,
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      tasks: [newTask, ...prev.tasks],
    }));
    showToast('Task added');
  };

  const toggleTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed } : t)),
    }));
  };

  const deleteTask = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
    showToast('Task deleted');
  };

  const updateSettings = (patch: Partial<WorkspaceSettings>) => {
    setState((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        ...patch,
        notifications: patch.notifications
          ? { ...prev.settings.notifications, ...patch.notifications }
          : prev.settings.notifications,
      },
    }));
    showToast('Settings saved');
  };

  const markAllNotificationsRead = () => {
    setState((prev) => ({
      ...prev,
      notifications: prev.notifications.map((n) => ({ ...n, read: true })),
    }));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      clients: INITIAL_CLIENTS,
      leads: INITIAL_LEADS,
      projects: INITIAL_PROJECTS,
      followUps: INITIAL_FOLLOWUPS,
      tasks: INITIAL_TASKS,
      activities: INITIAL_ACTIVITIES,
      monthlyRevenue: INITIAL_MONTHLY_REVENUE,
      notifications: INITIAL_NOTIFICATIONS,
      settings: INITIAL_SETTINGS,
    });
    setSelectedClientIdState(null);
    setSelectedLeadIdState(null);
    syncUrl({ section: activeSection, clientId: null, leadId: null, stageFilter: leadStageFilter }, true);
    showToast('Workspace reset to default sample data');
  };

  return (
    <CRMContext.Provider
      value={{
        ...state,
        activeSection,
        selectedClientId,
        selectedLeadId,
        leadStageFilter,
        isAddLeadOpen,
        isAddClientOpen,
        isAboutOpen,
        followUpModalTarget,
        aiDraftTarget,
        toastMessage,
        navigateTo,
        setSelectedClientId,
        setSelectedLeadId,
        setLeadStageFilter,
        openAddLeadModal: () => setIsAddLeadOpen(true),
        closeAddLeadModal: () => setIsAddLeadOpen(false),
        openAddClientModal: () => setIsAddClientOpen(true),
        closeAddClientModal: () => setIsAddClientOpen(false),
        openAboutModal: () => setIsAboutOpen(true),
        closeAboutModal: () => setIsAboutOpen(false),
        openFollowUpModal: (target) => setFollowUpModalTarget(target),
        closeFollowUpModal: () => setFollowUpModalTarget(null),
        openAIDraftModal: (target) => setAIDraftTarget(target),
        closeAIDraftModal: () => setAIDraftTarget(null),
        showToast,
        addLead,
        updateLead,
        moveLeadStage,
        convertLeadToClient,
        deleteLead,
        addClient,
        updateClient,
        addClientNote,
        togglePinNote,
        addClientFile,
        logCommunication,
        scheduleFollowUp,
        completeFollowUp,
        addProject,
        updateProjectStatus,
        toggleMilestone,
        addTask,
        toggleTask,
        deleteTask,
        updateSettings,
        markAllNotificationsRead,
        resetDemoData,
      }}
    >
      {children}
    </CRMContext.Provider>
  );
};

export function useCRM(): CRMContextValue {
  const ctx = useContext(CRMContext);
  if (!ctx) {
    throw new Error('useCRM must be used within a CRMProvider');
  }
  return ctx;
}
