import { LEAD_STAGES, LeadStage, NavSection } from '../types/crm';

export interface RouteState {
  section: NavSection;
  clientId: string | null;
  leadId: string | null;
  stageFilter: LeadStage | 'All';
}

const VALID_SECTIONS = new Set<NavSection>([
  'dashboard',
  'leads',
  'clients',
  'projects',
  'tasks',
  'reports',
  'settings',
]);

export function parseRouteFromLocation(pathname: string, search: string): RouteState {
  const trimmed = pathname.replace(/\/+$/, '') || '/';
  const segments = trimmed.split('/').filter(Boolean);
  const params = new URLSearchParams(search);

  let section: NavSection = 'dashboard';
  let clientId: string | null = null;
  let leadId: string | null = null;
  let stageFilter: LeadStage | 'All' = 'All';

  if (segments.length > 0) {
    const first = segments[0] as NavSection;
    if (VALID_SECTIONS.has(first)) {
      section = first;
    }
    if (section === 'clients' && segments[1]) {
      clientId = decodeURIComponent(segments[1]);
    }
  }

  if (section === 'leads') {
    const leadParam = params.get('lead');
    if (leadParam) {
      leadId = leadParam;
    }
    const stageParam = params.get('stage');
    if (stageParam && LEAD_STAGES.includes(stageParam as LeadStage)) {
      stageFilter = stageParam as LeadStage;
    }
  }

  return { section, clientId, leadId, stageFilter };
}

export function buildUrlFromRoute(route: RouteState): string {
  if (route.section === 'dashboard') {
    return '/';
  }

  if (route.section === 'clients') {
    return route.clientId ? `/clients/${encodeURIComponent(route.clientId)}` : '/clients';
  }

  if (route.section === 'leads') {
    const params = new URLSearchParams();
    if (route.stageFilter && route.stageFilter !== 'All') {
      params.set('stage', route.stageFilter);
    }
    if (route.leadId) {
      params.set('lead', route.leadId);
    }
    const qs = params.toString();
    return qs ? `/leads?${qs}` : '/leads';
  }

  return `/${route.section}`;
}
