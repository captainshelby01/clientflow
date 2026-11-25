/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CRMProvider, useCRM } from './context/CRMContext';
import { Layout } from './components/Layout';
import { DashboardPage } from './pages/DashboardPage';
import { LeadsPage } from './pages/LeadsPage';
import { ClientsPage } from './pages/ClientsPage';
import { ClientProfilePage } from './pages/ClientProfilePage';
import { ProjectsPage } from './pages/ProjectsPage';
import { TasksPage } from './pages/TasksPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { AddLeadModal } from './components/modals/AddLeadModal';
import { AddClientModal } from './components/modals/AddClientModal';
import { ScheduleFollowUpModal } from './components/modals/ScheduleFollowUpModal';
import { LeadDetailDrawer } from './components/modals/LeadDetailDrawer';

const WorkspaceRouter: React.FC = () => {
  const { activeSection, selectedClientId } = useCRM();

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardPage />;
      case 'leads':
        return <LeadsPage />;
      case 'clients':
        return selectedClientId ? (
          <ClientProfilePage clientId={selectedClientId} />
        ) : (
          <ClientsPage />
        );
      case 'projects':
        return <ProjectsPage />;
      case 'tasks':
        return <TasksPage />;
      case 'reports':
        return <ReportsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <Layout>
      {renderSection()}
      <AddLeadModal />
      <AddClientModal />
      <ScheduleFollowUpModal />
      <LeadDetailDrawer />
    </Layout>
  );
};

export default function App() {
  return (
    <CRMProvider>
      <WorkspaceRouter />
    </CRMProvider>
  );
}
