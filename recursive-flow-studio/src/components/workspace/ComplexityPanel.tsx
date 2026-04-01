import React from 'react';
import { Zap, Info, Database, Clock } from 'lucide-react';
import { ALGORITHM_SAMPLES } from '../../lib/samples';

interface ComplexityPanelProps {
  algorithmId: string;
}

export const ComplexityPanel: React.FC<ComplexityPanelProps> = ({ algorithmId }) => {
  const sample = (ALGORITHM_SAMPLES as any)[algorithmId];
  
  if (!sample) return (
    <div className="p-6 flex flex-col items-center justify-center h-full text-text-secondary italic opacity-50 gap-4">
      <Zap size={32} className="opacity-20" />
      Select an algorithm to see complexity analysis
    </div>
  );

  return (
    <div className="p-6 h-full overflow-y-auto space-y-8 custom-scrollbar">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-accent-blue uppercase tracking-widest flex items-center gap-2">
            <Clock size={14} /> Time Complexity
          </h3>
          <span className="text-xl font-mono text-text-primary font-bold drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">
            {sample.complexity?.time || 'O(N)'}
          </span>
        </div>
        <div className="glass p-4 rounded-xl border-l-4 border-accent-blue bg-accent-blue/5">
          <p className="text-xs text-text-secondary leading-relaxed">
            {sample.explanation || 'Recursive branching leads to this complexity profile.'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-accent-purple uppercase tracking-widest flex items-center gap-2">
            <Database size={14} /> Space Complexity
          </h3>
          <span className="text-xl font-mono text-text-primary font-bold drop-shadow-[0_0_8px_rgba(168,85,247,0.3)]">
            {sample.complexity?.space || 'O(N)'}
          </span>
        </div>
        <div className="glass p-4 rounded-xl border-l-4 border-accent-purple bg-accent-purple/5">
          <p className="text-xs text-text-secondary leading-relaxed">
            Maximum recursion depth determines the stack space required.
          </p>
        </div>
      </div>

      {sample.recurrence && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-accent-amber uppercase tracking-widest flex items-center gap-2">
            <Info size={14} /> Recurrence Relation
          </h3>
          <div className="glass p-4 rounded-xl font-mono text-sm text-accent-amber bg-accent-amber/5 border border-accent-amber/20">
            {sample.recurrence}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl bg-background-secondary border border-border-color space-y-3">
        <h4 className="text-[10px] font-bold text-text-primary uppercase tracking-widest">Optimization Tips</h4>
        <ul className="space-y-2">
          <li className="flex items-start gap-2 text-[11px] text-text-secondary">
            <div className="w-1 h-1 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
            Use memoization to cache results of expensive recursive calls.
          </li>
          <li className="flex items-start gap-2 text-[11px] text-text-secondary">
            <div className="w-1 h-1 rounded-full bg-accent-emerald mt-1.5 shrink-0" />
            Consider tail-call optimization if the language supports it.
          </li>
        </ul>
      </div>
    </div>
  );
};
