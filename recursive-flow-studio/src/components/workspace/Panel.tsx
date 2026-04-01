import React from 'react';
import { X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface PanelProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  onClose?: () => void;
  onMaximize?: () => void;
  isMaximized?: boolean;
}

export const Panel: React.FC<PanelProps> = ({ 
  title, 
  icon, 
  children, 
  onClose, 
  onMaximize, 
  isMaximized 
}) => {
  return (
    <div className={cn(
      "flex flex-col h-full bg-background-primary border border-border-color overflow-hidden rounded-lg",
      isMaximized && "fixed inset-4 z-50 shadow-2xl"
    )}>
      <div className="flex items-center justify-between h-9 px-3 bg-background-secondary border-b border-border-color shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-accent-blue">{icon}</span>
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          {onMaximize && (
            <button 
              onClick={onMaximize}
              className="p-1 text-text-secondary hover:text-text-primary hover:bg-background-card rounded transition-colors"
            >
              {isMaximized ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          )}
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1 text-text-secondary hover:text-accent-red hover:bg-accent-red/10 rounded transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
};
