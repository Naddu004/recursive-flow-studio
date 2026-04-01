import React from 'react';
import { EngineSettings } from '../../types';
import { X, Shield, Eye, Play, Palette } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsPanelProps {
  settings: EngineSettings;
  onUpdate: (settings: EngineSettings) => void;
  onClose: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onUpdate, onClose }) => {
  const updateSetting = (key: keyof EngineSettings, value: any) => {
    onUpdate({ ...settings, [key]: value });
  };

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 bottom-0 w-80 glass border-l border-border-color z-50 flex flex-col shadow-2xl"
    >
      <div className="h-12 flex items-center justify-between px-4 border-b border-border-color shrink-0 bg-background-secondary/50">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-accent-blue" />
          <span className="text-xs font-bold uppercase tracking-widest text-text-primary">Engine Settings</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded transition-colors text-text-secondary hover:text-text-primary">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-8 custom-scrollbar">
        {/* Recursion Limits */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Shield size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Recursion Limits</span>
          </div>
          <div className="grid gap-4">
            <SettingItem label="Max Depth" description="Maximum recursion depth allowed">
              <input 
                type="number" 
                value={settings.maxDepth}
                onChange={(e) => updateSetting('maxDepth', Number(e.target.value))}
                className="w-20 bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue"
              />
            </SettingItem>
            <SettingItem label="Max Nodes" description="Maximum total calls to visualize">
              <input 
                type="number" 
                value={settings.maxNodes}
                onChange={(e) => updateSetting('maxNodes', Number(e.target.value))}
                className="w-20 bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue"
              />
            </SettingItem>
            <SettingItem label="Timeout (ms)" description="Maximum execution time">
              <input 
                type="number" 
                value={settings.timeout}
                onChange={(e) => updateSetting('timeout', Number(e.target.value))}
                className="w-20 bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue"
              />
            </SettingItem>
            <SettingToggle 
              label="Recursion Guard" 
              description="Prevent obvious infinite loops"
              enabled={settings.recursionGuard}
              onToggle={() => updateSetting('recursionGuard', !settings.recursionGuard)}
            />
          </div>
        </section>

        {/* Visualization */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Eye size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Visualization</span>
          </div>
          <div className="grid gap-4">
            <SettingToggle 
              label="Auto Layout" 
              description="Automatically arrange nodes"
              enabled={settings.autoLayout}
              onToggle={() => updateSetting('autoLayout', !settings.autoLayout)}
            />
            <SettingToggle 
              label="Show Return Flow" 
              description="Visualize the return path"
              enabled={settings.showReturnFlow}
              onToggle={() => updateSetting('showReturnFlow', !settings.showReturnFlow)}
            />
            <SettingToggle 
              label="Curved Edges" 
              description="Use smooth bezier curves"
              enabled={settings.curvedEdges}
              onToggle={() => updateSetting('curvedEdges', !settings.curvedEdges)}
            />
            <SettingItem label="Collapse Threshold" description="Auto-collapse depth">
              <input 
                type="number" 
                value={settings.collapseDepthThreshold}
                onChange={(e) => updateSetting('collapseDepthThreshold', Number(e.target.value))}
                className="w-20 bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue"
              />
            </SettingItem>
          </div>
        </section>

        {/* Playback */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Play size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Playback</span>
          </div>
          <div className="grid gap-4">
            <SettingItem label="Default Speed" description="Playback speed multiplier">
              <select 
                value={settings.defaultSpeed}
                onChange={(e) => updateSetting('defaultSpeed', Number(e.target.value))}
                className="w-20 bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue"
              >
                <option value={0.5}>0.5x</option>
                <option value={1}>1.0x</option>
                <option value={2}>2.0x</option>
                <option value={5}>5.0x</option>
              </select>
            </SettingItem>
            <SettingToggle 
              label="Auto Play" 
              description="Start playback automatically"
              enabled={settings.autoPlay}
              onToggle={() => updateSetting('autoPlay', !settings.autoPlay)}
            />
          </div>
        </section>

        {/* Theme */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-text-secondary">
            <Palette size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Theme</span>
          </div>
          <div className="grid gap-4">
            <SettingItem label="Glow Intensity" description="Node glow effect strength">
              <input 
                type="range" 
                min="0" max="100"
                value={settings.nodeGlowIntensity}
                onChange={(e) => updateSetting('nodeGlowIntensity', Number(e.target.value))}
                className="w-full h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent-blue"
              />
            </SettingItem>
            <SettingItem label="Edge Thickness" description="Line width for edges">
              <input 
                type="range" 
                min="1" max="5"
                value={settings.edgeThickness}
                onChange={(e) => updateSetting('edgeThickness', Number(e.target.value))}
                className="w-full h-1 bg-background-card rounded-lg appearance-none cursor-pointer accent-accent-blue"
              />
            </SettingItem>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const SettingItem = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="text-xs font-medium text-text-primary">{label}</span>
      <span className="text-[10px] text-text-secondary">{description}</span>
    </div>
    {children}
  </div>
);

const SettingToggle = ({ label, description, enabled, onToggle }: { label: string, description: string, enabled: boolean, onToggle: () => void }) => (
  <div className="flex items-center justify-between gap-4">
    <div className="flex flex-col">
      <span className="text-xs font-medium text-text-primary">{label}</span>
      <span className="text-[10px] text-text-secondary">{description}</span>
    </div>
    <button 
      onClick={onToggle}
      className={`w-8 h-4 rounded-full relative transition-colors ${enabled ? 'bg-accent-blue' : 'bg-background-card border border-border-color'}`}
    >
      <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${enabled ? 'left-4.5' : 'left-0.5'}`} />
    </button>
  </div>
);
