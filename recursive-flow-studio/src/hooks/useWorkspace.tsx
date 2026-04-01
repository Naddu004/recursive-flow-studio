import React, { createContext, useContext, useState, useEffect } from 'react';
import { PanelId, PanelState } from '../types';

interface WorkspaceContextType {
  panels: PanelState[];
  setPanels: (panels: PanelState[]) => void;
  togglePanel: (id: PanelId) => void;
  maximizePanel: (id: PanelId) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

const DEFAULT_PANELS: PanelState[] = [
  { id: 'editor', isVisible: true, isMaximized: false },
  { id: 'tree', isVisible: true, isMaximized: false },
  { id: 'metrics', isVisible: true, isMaximized: false },
  { id: 'complexity', isVisible: false, isMaximized: false },
  { id: 'help', isVisible: false, isMaximized: false },
  { id: 'output', isVisible: true, isMaximized: false },
];

export const WorkspaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [panels, setPanels] = useState<PanelState[]>(() => {
    const saved = localStorage.getItem('rf_panels');
    return saved ? JSON.parse(saved) : DEFAULT_PANELS;
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = localStorage.getItem('rf_sidebar_collapsed');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    localStorage.setItem('rf_panels', JSON.stringify(panels));
  }, [panels]);

  useEffect(() => {
    localStorage.setItem('rf_sidebar_collapsed', JSON.stringify(sidebarCollapsed));
  }, [sidebarCollapsed]);

  const togglePanel = (id: PanelId) => {
    setPanels(prev => prev.map(p => 
      p.id === id ? { ...p, isVisible: !p.isVisible } : p
    ));
  };

  const maximizePanel = (id: PanelId) => {
    setPanels(prev => prev.map(p => 
      p.id === id ? { ...p, isMaximized: !p.isMaximized } : { ...p, isMaximized: false }
    ));
  };

  return (
    <WorkspaceContext.Provider value={{ panels, setPanels, togglePanel, maximizePanel, sidebarCollapsed, setSidebarCollapsed }}>
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return context;
};
