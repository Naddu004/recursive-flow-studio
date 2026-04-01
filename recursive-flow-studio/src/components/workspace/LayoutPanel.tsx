import React from 'react';
import { Layout as LayoutIcon, Maximize, Minimize, Columns, Rows, Grid } from 'lucide-react';

export const LayoutPanel = () => {
  return (
    <div className="p-6 h-full overflow-y-auto space-y-8 custom-scrollbar">
      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-4 flex items-center gap-2">
            <LayoutIcon size={14} /> Workspace Presets
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 glass rounded-xl border-accent-blue/20 bg-accent-blue/5 hover:bg-accent-blue/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue mb-2 group-hover:scale-110 transition-transform">
                <Columns size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Standard IDE</div>
              <div className="text-[10px] text-text-secondary">Balanced editor and tree</div>
            </button>
            <button className="p-4 glass rounded-xl border-accent-purple/20 bg-accent-purple/5 hover:bg-accent-purple/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple mb-2 group-hover:scale-110 transition-transform">
                <Maximize size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Visual Focus</div>
              <div className="text-[10px] text-text-secondary">Maximize recursion tree</div>
            </button>
            <button className="p-4 glass rounded-xl border-accent-amber/20 bg-accent-amber/5 hover:bg-accent-amber/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-amber/20 flex items-center justify-center text-accent-amber mb-2 group-hover:scale-110 transition-transform">
                <Rows size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Debug Mode</div>
              <div className="text-[10px] text-text-secondary">Focus on metrics and output</div>
            </button>
            <button className="p-4 glass rounded-xl border-accent-emerald/20 bg-accent-emerald/5 hover:bg-accent-emerald/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-emerald/20 flex items-center justify-center text-accent-emerald mb-2 group-hover:scale-110 transition-transform">
                <Grid size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Compact</div>
              <div className="text-[10px] text-text-secondary">Show all panels at once</div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-accent-purple uppercase tracking-widest mb-4 flex items-center gap-2">
            <Minimize size={14} /> Panel Management
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 glass rounded-xl border-border-color hover:border-accent-purple/40 transition-all flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center text-accent-purple group-hover:scale-110 transition-transform">
                <LayoutIcon size={16} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-text-primary">Reset All Panels</div>
                <div className="text-[10px] text-text-secondary">Restore default workspace layout</div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
