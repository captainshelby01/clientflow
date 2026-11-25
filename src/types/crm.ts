export type NavSection =
  | 'dashboard'
  | 'leads'
  | 'clients'
  | 'projects'
  | 'tasks'
  | 'reports'
  | 'settings';

export type LeadStage =
  | 'New Lead'
  | 'Contacted'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost';

export const LEAD_STAGES: LeadStage[] = [
  'New Lead',
  'Contacted',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export type ClientStatus = 'Active' | 'Retainer' | 'Onboarding' | 'Past';

export type CurrencyCode = 'USD' | 'GBP' | 'EUR' | 'NGN';

export interface Lead {
  id: string;
  name: string;
  role: string;
  company: string;
  email: string;
  phone: string;
  industry: string;
  serviceScope: string;
  value: number;
  stage: LeadStage;
  source: 'Referral' | 'Inbound Website' | 'LinkedIn' | 'Partner Agency' | 'Direct Outreach';
  probability: number;
  expectedCloseDate: string;
  nextFollowUpDate: string;
  notes: string;
  createdAt: string;
  convertedClientId?: string;
}

export interface ProjectMilestone {
  id: string;
  title: string;
  dueDate: string;
  completed: boolean;
}

export interface Project {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  company: string;
  status: 'Planning' | 'In Progress' | 'Review' | 'Completed';
  phase: string;
  budget: number;
  billed: number;
  startDate: string;
  dueDate: string;
  progress: number;
  summary: string;
  deliverables: string[];
  milestones: ProjectMilestone[];
}

export interface ClientNote {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  pinned?: boolean;
}

export interface ClientFile {
  id: string;
  name: string;
  category: 'Proposal' | 'Contract' | 'Deliverable' | 'Invoice' | 'Brief';
  fileType: 'PDF' | 'Figma' | 'DOCX' | 'XLSX' | 'ZIP';
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  summary: string;
}

export interface CommunicationEntry {
  id: string;
  type: 'Email' | 'Call' | 'Meeting' | 'Proposal' | 'Invoice' | 'Note';
  title: string;
  summary: string;
  date: string;
  time: string;
  author: string;
}

export interface FollowUp {
  id: string;
  targetType: 'client' | 'lead';
  targetId: string;
  contactName: string;
  company: string;
  date: string;
  time: string;
  channel: 'Call' | 'Video Call' | 'Email' | 'In-person';
  agenda: string;
  completed: boolean;
}

export interface Client {
  id: string;
  name: string;
  role: string;
  company: string;
  industry: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  timezone: string;
  billingTerms: string;
  preferredChannel: 'Email' | 'Video Call' | 'Phone' | 'Slack';
  status: ClientStatus;
  lastContactDate: string;
  totalValue: number;
  monthlyRetainer?: number;
  tags: string[];
  notes: ClientNote[];
  files: ClientFile[];
  timeline: CommunicationEntry[];
}

export interface TaskItem {
  id: string;
  title: string;
  category: 'Follow-up' | 'Deliverable' | 'Proposal' | 'Meeting' | 'Admin';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string;
  dueTime: string;
  completed: boolean;
  linkedType?: 'client' | 'lead' | 'project';
  linkedId?: string;
  linkedLabel?: string;
}

export interface ActivityItem {
  id: string;
  category: 'Proposal' | 'Lead' | 'Invoice' | 'Project' | 'Follow-up' | 'Client';
  title: string;
  description: string;
  timestampLabel: string;
  targetSection?: NavSection;
  targetId?: string;
}

export interface MonthlyRevenuePoint {
  month: string;
  fullMonth: string;
  revenue: number;
  target: number;
  invoicesCount: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeLabel: string;
  read: boolean;
  section: NavSection;
  targetId?: string;
}

export interface WorkspaceSettings {
  ownerName: string;
  ownerInitials: string;
  ownerRole: string;
  ownerEmail: string;
  workspaceName: string;
  planName: string;
  currency: CurrencyCode;
  defaultFollowUpDays: number;
  monthlyRevenueTarget: number;
  timezone: string;
  notifications: {
    dailyFollowUpDigest: boolean;
    proposalViewedAlerts: boolean;
    overdueTaskAlerts: boolean;
    invoicePaidAlerts: boolean;
  };
}
