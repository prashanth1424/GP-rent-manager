import React from 'react';
import { Home, Users, Receipt, FileText, Settings } from 'lucide-react';
import styles from './BottomTabBar.module.css';

export const BottomTabBar = ({ currentTab, onTabChange }) => {
  const tabs = [
    { id: 'rooms', label: 'Rooms', icon: Home },
    { id: 'tenants', label: 'Tenants', icon: Users },
    { id: 'bills', label: 'Bills', icon: Receipt },
    { id: 'paperwork', label: 'Paperwork', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <Icon size={24} />
            <span className={styles.label}>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
