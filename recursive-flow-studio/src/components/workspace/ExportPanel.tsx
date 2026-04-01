import React from 'react';
import { Image as ImageIcon, Download, Share2, FileJson, FileCode, Printer } from 'lucide-react';

export const ExportPanel = () => {
  return (
    <div className="p-6 h-full overflow-y-auto space-y-8 custom-scrollbar">
      <div className="space-y-6">
        <section>
          <h3 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest mb-4 flex items-center gap-2">
            <ImageIcon size={14} /> Image Export
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 glass rounded-xl border-accent-blue/20 bg-accent-blue/5 hover:bg-accent-blue/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-blue/20 flex items-center justify-center text-accent-blue mb-2 group-hover:scale-110 transition-transform">
                <Download size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Download PNG</div>
              <div className="text-[10px] text-text-secondary">High resolution snapshot</div>
            </button>
            <button className="p-4 glass rounded-xl border-accent-purple/20 bg-accent-purple/5 hover:bg-accent-purple/10 transition-all group flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-accent-purple/20 flex items-center justify-center text-accent-purple mb-2 group-hover:scale-110 transition-transform">
                <ImageIcon size={20} />
              </div>
              <div className="text-xs font-bold text-text-primary">Download SVG</div>
              <div className="text-[10px] text-text-secondary">Scalable vector graphics</div>
            </button>
          </div>
        </section>

        <section>
          <h3 className="text-[10px] font-bold text-accent-emerald uppercase tracking-widest mb-4 flex items-center gap-2">
            <FileCode size={14} /> Data Export
          </h3>
          <div className="space-y-3">
            <button className="w-full p-3 glass rounded-xl border-border-color hover:border-accent-emerald/40 transition-all flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform">
                <FileJson size={16} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-text-primary">Export Trace Data</div>
                <div className="text-[10px] text-text-secondary">JSON format for external analysis</div>
              </div>
            </button>
            <button className="w-full p-3 glass rounded-xl border-border-color hover:border-accent-emerald/40 transition-all flex items-center gap-3 group">
              <div className="w-8 h-8 rounded-lg bg-accent-emerald/20 flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform">
                <Printer size={16} />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-text-primary">Print Report</div>
                <div className="text-[10px] text-text-secondary">Generate a PDF summary</div>
              </div>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
