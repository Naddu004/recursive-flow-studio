import React from 'react';
import { X, Layout, Maximize, Minimize, Monitor, Columns, Grid } from 'lucide-react';

interface LayoutPresetsModalProps {
  onClose: () => void;
  onSelect: (presetId: string) => void;
}

export const LayoutPresetsModal: React.FC<LayoutPresetsModalProps> = ({ onClose, onSelect }) => {
  const presets = [
    { id: 'default', name: 'Default IDE', icon: <Layout size={20} />, description: 'Standard layout with editor and tree side-by-side.' },
    { id: 'full-tree', name: 'Full Tree', icon: <Maximize size={20} />, description: 'Maximize the recursion tree for deep inspection.' },
    { id: 'editor-focus', name: 'Editor Focus', icon: <Monitor size={20} />, description: 'Focus on code writing with a smaller tree view.' },
    { id: 'debug-focus', name: 'Debug Focus', icon: <Columns size={20} />, description: 'Balanced view with metrics and output console.' },
    { id: 'teaching-mode', name: 'Teaching Mode', icon: <Grid size={20} />, description: 'Simplified view with large nodes and explanations.' },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[500px] bg-background-secondary border border-border-color rounded-xl shadow-2xl overflow-hidden">
        <div className="h-12 flex items-center justify-between px-4 border-b border-border-color">
          <div className="flex items-center gap-2">
            <Layout size={16} className="text-accent-blue" />
            <span className="text-xs font-bold uppercase tracking-widest">Layout Presets</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-background-card rounded transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-1 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                onSelect(preset.id);
                onClose();
              }}
              className="flex items-center gap-4 p-4 bg-background-card border border-border-color rounded-lg hover:border-accent-blue hover:bg-accent-blue/5 transition-all text-left group"
            >
              <div className="p-3 bg-background-secondary rounded-lg text-text-secondary group-hover:text-accent-blue transition-colors">
                {preset.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-text-primary">{preset.name}</span>
                <span className="text-xs text-text-secondary">{preset.description}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
