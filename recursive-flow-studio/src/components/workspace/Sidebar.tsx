import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { cn } from '../../lib/utils';
import { 
  Code2, 
  Activity, 
  Network, 
  HelpCircle, 
  Zap, 
  Terminal, 
  ChevronLeft, 
  ChevronRight,
  Settings,
  Share2,
  Image as ImageIcon,
  Layout as LayoutIcon,
  BookOpen
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const SidebarItem = ({ icon: Icon, label, id, active, onClick, collapsed }: any) => (
  <button
    onClick={() => onClick(id)}
    className={cn(
      "group relative flex items-center w-full p-3 mb-1 rounded-lg transition-all duration-200",
      active ? "bg-accent-blue/10 text-accent-blue" : "text-text-secondary hover:bg-background-card hover:text-text-primary"
    )}
  >
    <Icon size={20} className={cn("min-w-[20px]", active && "drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]")} />
    <AnimatePresence>
      {!collapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="ml-3 text-sm font-medium whitespace-nowrap"
        >
          {label}
        </motion.span>
      )}
    </AnimatePresence>
    {collapsed && (
      <div className="absolute left-full ml-2 px-2 py-1 bg-background-card border border-border-color rounded text-xs text-text-primary opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 whitespace-nowrap">
        {label}
      </div>
    )}
  </button>
);

export const Sidebar = ({ onActionClick }: { onActionClick?: (id: string) => void }) => {
  const { panels, togglePanel, sidebarCollapsed, setSidebarCollapsed } = useWorkspace();

  const workspaceItems = [
    { id: 'editor', label: 'Code Editor', icon: Code2 },
    { id: 'tree', label: 'Recursion Tree', icon: Network },
    { id: 'metrics', label: 'Execution Metrics', icon: Activity },
    { id: 'complexity', label: 'Complexity Analysis', icon: Zap },
    { id: 'help', label: 'Help Center', icon: HelpCircle },
    { id: 'output', label: 'Output Panel', icon: Terminal },
  ];

  const actionItems = [
    { id: 'samples', label: 'Algorithm Samples', icon: BookOpen },
    { id: 'settings', label: 'Engine Settings', icon: Settings },
    { id: 'share', label: 'Share Workspace', icon: Share2 },
    { id: 'export', label: 'Export Image', icon: ImageIcon },
    { id: 'layouts', label: 'Layout Presets', icon: LayoutIcon },
  ];

  return (
    <div className="relative flex h-full">
      <motion.aside
        animate={{ width: sidebarCollapsed ? 64 : 240 }}
        className="flex flex-col h-full bg-background-secondary border-r border-border-color p-3 z-30"
      >
        <div className="flex items-center mb-8 px-1 overflow-hidden">
          <div className="w-8 h-8 rounded bg-accent-blue flex items-center justify-center shrink-0">
            <Network size={20} className="text-white" />
          </div>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3 font-bold text-lg tracking-tight text-text-primary whitespace-nowrap"
            >
              Flow Studio
            </motion.span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden">
          <div className="mb-6">
            {!sidebarCollapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-50">
                Workspace
              </h3>
            )}
            {workspaceItems.map(item => (
              <SidebarItem
                key={item.id}
                {...item}
                active={panels.find(p => p.id === item.id)?.isVisible}
                onClick={togglePanel}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>

          <div>
            {!sidebarCollapsed && (
              <h3 className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-text-secondary opacity-50">
                Actions
              </h3>
            )}
            {actionItems.map(item => (
              <SidebarItem
                key={item.id}
                {...item}
                onClick={onActionClick}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>
        </div>
      </motion.aside>

      {/* Floating Divider Chip */}
      <div 
        className="absolute top-1/2 -right-3 transform -translate-y-1/2 z-40 cursor-pointer group"
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
      >
        <div className="w-6 h-12 glass rounded-full flex items-center justify-center hover:bg-accent-blue/20 transition-colors">
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </div>
      </div>
    </div>
  );
};
