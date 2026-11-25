import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BarChart3,
  Bell,
  Briefcase,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useCRM } from '../context/CRMContext';
import { NavSection } from '../types/crm';
import { formatCurrency } from '../utils/format';

interface NavItem {
  id: NavSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const PRIMARY_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'leads', label: 'Leads', icon: FolderKanban },
  { id: 'clients', label: 'Clients', icon: Users },
  { id: 'projects', label: 'Projects', icon: Briefcase },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
];

const SECONDARY_NAV: NavItem[] = [
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    activeSection,
    selectedClientId,
    navigateTo,
    clients,
    leads,
    projects,
    tasks,
    notifications,
    markAllNotificationsRead,
    settings,
    toastMessage,
  } = useCRM();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      } else if (e.key === 'Escape') {
        setSearchFocused(false);
        setNotifOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const openTasksCount = tasks.filter((t) => !t.completed).length;

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return { clients: [], leads: [], projects: [] };
    return {
      clients: clients
        .filter(
          (c) =>
            c.name.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) ||
            c.industry.toLowerCase().includes(q)
        )
        .slice(0, 4),
      leads: leads
        .filter(
          (l) =>
            l.name.toLowerCase().includes(q) ||
            l.company.toLowerCase().includes(q) ||
            l.serviceScope.toLowerCase().includes(q)
        )
        .slice(0, 4),
      projects: projects
        .filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.company.toLowerCase().includes(q)
        )
        .slice(0, 3),
    };
  }, [searchQuery, clients, leads, projects]);

  const hasSearchResults =
    searchResults.clients.length > 0 ||
    searchResults.leads.length > 0 ||
    searchResults.projects.length > 0;

  const handleNavClick = (section: NavSection) => {
    navigateTo(section);
    setMobileMenuOpen(false);
  };

  const selectedClient = selectedClientId
    ? clients.find((c) => c.id === selectedClientId)
    : null;

  const renderNavButton = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeSection === item.id;
    const badgeCount =
      item.id === 'tasks' && openTasksCount > 0 ? openTasksCount : undefined;

    return (
      <button
        key={item.id}
        type="button"
        onClick={() => handleNavClick(item.id)}
        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 lg:py-2 rounded-lg text-[13.5px] transition-colors duration-150 cursor-pointer whitespace-nowrap ${
          isActive
            ? 'bg-[#F3F1EC] text-[#13233A] font-semibold'
            : 'text-[#525866] font-medium hover:bg-[#F8F7F4] hover:text-[#1A1D24]'
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <Icon
            className={`w-[16px] h-[16px] shrink-0 transition-colors ${
              isActive ? 'text-[#13233A]' : 'text-[#7A808D]'
            }`}
          />
          <span className="truncate">{item.label}</span>
        </span>
        {badgeCount !== undefined && (
          <span
            className={`text-[11px] tabular-nums ${
              isActive ? 'text-[#13233A] font-semibold' : 'text-[#7A808D]'
            }`}
          >
            {badgeCount}
          </span>
        )}
      </button>
    );
  };

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between py-5 px-3.5 bg-white border-r border-[#E5E2DC]">
      <div>
        {/* Brand */}
        <div className="flex items-center justify-between px-2.5 mb-7">
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
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
            <span className="font-display font-bold text-[16px] tracking-tight text-[#1A1D24] whitespace-nowrap">
              ClientFlow
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="lg:hidden p-2 rounded-md text-[#7A808D] hover:text-[#1A1D24] hover:bg-[#F3F1EC] cursor-pointer"
            aria-label="Close navigation menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-5" aria-label="Main Navigation">
          <div className="space-y-0.5">{PRIMARY_NAV.map(renderNavButton)}</div>

          <div className="pt-4 border-t border-[#ECEAE4] space-y-0.5">
            {SECONDARY_NAV.map(renderNavButton)}
          </div>
        </nav>
      </div>

      {/* Bottom Workspace Card */}
      <button
        type="button"
        onClick={() => handleNavClick('settings')}
        className="w-full px-3 py-2.5 rounded-lg border border-[#ECEAE4] bg-[#FAF9F6] hover:border-[#D5D0C6] transition-colors text-left cursor-pointer group"
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12.5px] font-semibold text-[#1A1D24] truncate">
            {settings.workspaceName}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-[#A8A298] group-hover:text-[#13233A] shrink-0" />
        </div>
        <div className="text-[11px] text-[#7A808D] mt-0.5 flex items-center justify-between tabular-nums">
          <span>{settings.planName}</span>
          <span>{settings.currency}</span>
        </div>
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#F8F7F4] text-[#1A1D24]">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-[238px] shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Drawer Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-[#13233A]/30 backdrop-blur-[1px]"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside className="relative z-10 w-[264px] h-full shadow-xl">
            {SidebarContent}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 h-[58px] bg-white/95 backdrop-blur-xs border-b border-[#E5E2DC] px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 -ml-1.5 rounded-md text-[#525866] hover:bg-[#F3F1EC] cursor-pointer shrink-0 min-h-[40px] min-w-[40px] flex items-center justify-center"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Global Search */}
            <div ref={searchRef} className="relative flex-1 max-w-md">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-[#7A808D] absolute left-3 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onFocus={() => setSearchFocused(true)}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setSearchFocused(true);
                  }}
                  placeholder="Search leads, clients, projects..."
                  className="w-full pl-8.5 pr-12 py-1.5 text-[13px] bg-[#FAF9F6] border border-[#E5E2DC] rounded-lg text-[#1A1D24] placeholder:text-[#7A808D] focus:bg-white focus:border-[#13233A] focus:outline-none transition-colors"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 p-0.5 text-[#7A808D] hover:text-[#1A1D24] cursor-pointer"
                    aria-label="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-block absolute right-2.5 text-[10px] font-medium text-[#7A808D] bg-white border border-[#E5E2DC] rounded px-1.5 py-0.5 pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </div>

              {/* Search Dropdown */}
              {searchFocused && searchQuery.trim().length > 0 && (
                <div className="absolute left-0 right-0 mt-1.5 bg-white border border-[#E5E2DC] rounded-lg shadow-lg z-40 max-h-[380px] overflow-y-auto divide-y divide-[#ECEAE4]">
                  {!hasSearchResults ? (
                    <div className="px-4 py-6 text-xs text-[#7A808D] text-center">
                      No matching clients, leads, or projects for "{searchQuery}".
                    </div>
                  ) : (
                    <>
                      {searchResults.clients.length > 0 && (
                        <div className="p-2">
                          <div className="px-2.5 py-1 text-[11px] font-semibold text-[#7A808D]">
                            Clients
                          </div>
                          {searchResults.clients.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                navigateTo('clients', { clientId: c.id });
                                setSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-medium text-[#1A1D24] truncate">
                                  {c.name}
                                </div>
                                <div className="text-[11px] text-[#7A808D] truncate">
                                  {c.company} · {c.industry}
                                </div>
                              </div>
                              <span className="text-xs tabular-nums text-[#525866] shrink-0">
                                {formatCurrency(c.totalValue, settings.currency)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.leads.length > 0 && (
                        <div className="p-2">
                          <div className="px-2.5 py-1 text-[11px] font-semibold text-[#7A808D]">
                            Leads
                          </div>
                          {searchResults.leads.map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => {
                                navigateTo('leads', { leadId: l.id });
                                setSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-medium text-[#1A1D24] truncate">
                                  {l.name}
                                </div>
                                <div className="text-[11px] text-[#7A808D] truncate">
                                  {l.company} · {l.stage}
                                </div>
                              </div>
                              <span className="text-xs tabular-nums text-[#525866] shrink-0">
                                {formatCurrency(l.value, settings.currency)}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}

                      {searchResults.projects.length > 0 && (
                        <div className="p-2">
                          <div className="px-2.5 py-1 text-[11px] font-semibold text-[#7A808D]">
                            Projects
                          </div>
                          {searchResults.projects.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => {
                                navigateTo('projects');
                                setSearchFocused(false);
                                setSearchQuery('');
                              }}
                              className="w-full flex items-center justify-between px-2.5 py-2 text-left rounded-md hover:bg-[#FAF9F6] cursor-pointer"
                            >
                              <div className="min-w-0 pr-3">
                                <div className="text-xs font-medium text-[#1A1D24] truncate">
                                  {p.title}
                                </div>
                                <div className="text-[11px] text-[#7A808D] truncate">
                                  {p.company} · {p.status}
                                </div>
                              </div>
                              <span className="text-xs tabular-nums text-[#525866] shrink-0">
                                {p.progress}%
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Contextual Breadcrumb when viewing Client Profile */}
            {activeSection === 'clients' && selectedClient && (
              <div className="hidden md:flex items-center gap-1.5 text-xs text-[#7A808D] pl-2 truncate">
                <button
                  type="button"
                  onClick={() => navigateTo('clients', { clientId: null })}
                  className="hover:text-[#13233A] cursor-pointer whitespace-nowrap"
                >
                  Clients
                </button>
                <span>/</span>
                <span className="text-[#1A1D24] font-medium truncate">
                  {selectedClient.company}
                </span>
              </div>
            )}
          </div>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Notification Bell */}
            <div ref={notifRef} className="relative">
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-lg text-[#525866] hover:bg-[#F3F1EC] hover:text-[#1A1D24] transition-colors cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#B4690E]" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E2DC] rounded-lg shadow-lg z-40">
                  <div className="px-4 py-3 border-b border-[#ECEAE4] flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#1A1D24]">
                      Notifications ({unreadCount} unread)
                    </span>
                    {unreadCount > 0 && (
                      <button
                        type="button"
                        onClick={markAllNotificationsRead}
                        className="text-[11px] font-medium text-[#13233A] hover:underline cursor-pointer"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#ECEAE4]">
                    {notifications.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {
                          navigateTo(n.section, {
                            clientId: n.section === 'clients' ? n.targetId ?? null : null,
                          });
                          setNotifOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-[#FAF9F6] transition-colors cursor-pointer ${
                          n.read ? 'opacity-65' : 'bg-[#FEF6E9]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-medium text-[#1A1D24]">
                            {n.title}
                          </span>
                          <span className="text-[10.5px] text-[#7A808D] shrink-0">
                            {n.timeLabel}
                          </span>
                        </div>
                        <p className="text-[11.5px] text-[#525866] mt-0.5 leading-snug">
                          {n.description}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-5 w-px bg-[#E5E2DC]" />

            {/* Profile Button */}
            <button
              type="button"
              onClick={() => navigateTo('settings')}
              className="flex items-center gap-2.5 py-1 px-1.5 rounded-lg hover:bg-[#F3F1EC] transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-[#EFECE5] border border-[#DFDBD2] flex items-center justify-center text-xs font-semibold text-[#13233A] shrink-0">
                {settings.ownerInitials}
              </div>
              <div className="hidden sm:block leading-tight">
                <div className="text-[13px] font-medium text-[#1A1D24] whitespace-nowrap">
                  {settings.ownerName}
                </div>
                <div className="text-[11px] text-[#7A808D] whitespace-nowrap">
                  {settings.ownerRole}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-7 max-w-[1440px] w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Action Toast */}
      {toastMessage && (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 bg-[#13233A] text-white text-xs font-medium px-4 py-2.5 rounded-lg shadow-lg border border-white/10"
        >
          {toastMessage}
        </div>
      )}
    </div>
  );
};
