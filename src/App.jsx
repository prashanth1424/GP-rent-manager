import React, { useState } from 'react';
import { RentProvider } from './context/RentContext';
import { BottomTabBar } from './components/layout/BottomTabBar';
import { RoomList } from './modules/rooms/RoomList';
import { TenantList } from './modules/tenants/TenantList';
import { BillDashboard } from './modules/bills/BillDashboard';
import { PaperworkList } from './modules/paperwork/PaperworkList';
import { SettingsPage } from './modules/settings/SettingsPage';

function MainApp() {
  const [currentTab, setCurrentTab] = useState('rooms');

  const renderModule = () => {
    switch (currentTab) {
      case 'rooms': return <RoomList />;
      case 'tenants': return <TenantList />;
      case 'bills': return <BillDashboard />;
      case 'paperwork': return <PaperworkList />;
      case 'settings': return <SettingsPage />;
      default: return <RoomList />;
    }
  };

  return (
    <>
      <main className="main-content">
        {renderModule()}
      </main>
      <BottomTabBar currentTab={currentTab} onTabChange={setCurrentTab} />
    </>
  );
}

function App() {
  return (
    <RentProvider>
      <MainApp />
    </RentProvider>
  );
}

export default App;
