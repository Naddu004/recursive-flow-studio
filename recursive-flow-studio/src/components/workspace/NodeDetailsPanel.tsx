import React from 'react';
import { RecursionNode, DESIGN_TOKENS } from '../../types';
import { 
  X, 
  ArrowRight, 
  ChevronRight, 
  ChevronDown, 
  Layers, 
  Variable, 
  RefreshCw, 
  History,
  Terminal,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';

interface NodeDetailsPanelProps {
  node: RecursionNode | null;
  onClose: () => void;
  onJumpToNode?: (nodeId: string) => void;
}

export const NodeDetailsPanel: React.FC<NodeDetailsPanelProps> = ({ 
  node, 
  onClose,
  onJumpToNode
}) => {
  if (!node) return null;

  const changedParams = node.changedParams || [];
  const localVars = node.localVariables || {};
  const hasLocalVars = Object.keys(localVars).length > 0;

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="absolute right-0 top-0 bottom-0 w-96 glass border-l border-border z-50 flex flex-col shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-border flex items-center justify-between bg-background-secondary/50">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-3 h-3 rounded-full animate-pulse",
            node.state === 'active' ? "bg-accent-blue" : 
            node.state === 'completed' ? "bg-accent-emerald" :
            node.state === 'base_case' ? "bg-accent-cyan" : "bg-accent-purple"
          )} />
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">
            Node Inspection
          </h2>
        </div>
        <button 
          onClick={onClose}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-text-secondary hover:text-text-primary"
        >
          <X size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Call Signature */}
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-accent-blue">
            <Terminal size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Call Signature</span>
          </div>
          <div className="p-3 rounded-xl bg-black/40 border border-white/5 font-mono text-sm break-all">
            <span className="text-accent-purple">{node.name}</span>
            <span className="text-text-secondary">(</span>
            {Object.entries(node.args).map(([key, val], i, arr) => (
              <React.Fragment key={key}>
                <span className="text-accent-amber">{key}</span>
                <span className="text-text-secondary">: </span>
                <span className="text-text-primary">{JSON.stringify(val)}</span>
                {i < arr.length - 1 && <span className="text-text-secondary">, </span>}
              </React.Fragment>
            ))}
            <span className="text-text-secondary">)</span>
          </div>
        </section>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-2">
          <div className="px-2 py-1 rounded-md bg-accent-blue/10 border border-accent-blue/20 text-[10px] font-bold text-accent-blue uppercase">
            Call #{node.callNumber}
          </div>
          <div className="px-2 py-1 rounded-md bg-accent-purple/10 border border-accent-purple/20 text-[10px] font-bold text-accent-purple uppercase">
            Depth {node.depth}
          </div>
          <div className={cn(
            "px-2 py-1 rounded-md border text-[10px] font-bold uppercase",
            node.state === 'active' ? "bg-accent-blue/10 border-accent-blue/20 text-accent-blue" : 
            node.state === 'completed' ? "bg-accent-emerald/10 border-accent-emerald/20 text-accent-emerald" :
            node.state === 'base_case' ? "bg-accent-cyan/10 border-accent-cyan/20 text-accent-cyan" :
            "bg-accent-purple/10 border-accent-purple/20 text-accent-purple"
          )}>
            {node.state.replace('_', ' ')}
          </div>
        </div>

        {/* Parameters & Changes */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent-amber">
              <Layers size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Parameters</span>
            </div>
            {changedParams.length > 0 && (
              <span className="text-[9px] font-bold text-accent-blue bg-accent-blue/10 px-1.5 py-0.5 rounded uppercase">
                {changedParams.length} Changes
              </span>
            )}
          </div>
          <div className="space-y-2">
            {Object.entries(node.args).map(([key, val]) => {
              const isChanged = changedParams.includes(key);
              return (
                <div 
                  key={key}
                  className={cn(
                    "flex items-center justify-between p-2 rounded-lg border transition-all",
                    isChanged ? "bg-accent-blue/5 border-accent-blue/30 shadow-[0_0_10px_rgba(59,130,246,0.1)]" : "bg-white/5 border-white/5"
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-accent-amber">{key}</span>
                    {isChanged && (
                      <div className="flex items-center gap-1 text-accent-blue">
                        <RefreshCw size={10} className="animate-spin-slow" />
                        <span className="text-[8px] font-bold uppercase">Changed</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs font-mono text-text-primary">{JSON.stringify(val)}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Local Variables */}
        {hasLocalVars && (
          <section className="space-y-3">
            <div className="flex items-center gap-2 text-accent-emerald">
              <Variable size={14} />
              <span className="text-[10px] font-bold uppercase tracking-wider">Local Variables</span>
            </div>
            <div className="space-y-2">
              {Object.entries(localVars).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xs font-mono text-accent-emerald">{key}</span>
                  <span className="text-xs font-mono text-text-primary">{JSON.stringify(val)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Return Value */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-accent-cyan">
            <ArrowRight size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Return Value</span>
          </div>
          <div className="p-4 rounded-xl bg-accent-cyan/5 border border-accent-cyan/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-secondary font-medium">Result</span>
              <span className="text-sm font-mono font-bold text-accent-cyan">
                {node.result !== undefined ? JSON.stringify(node.result) : 'Pending...'}
              </span>
            </div>
            {node.returnExplanation && (
              <div className="flex gap-2 p-2 rounded-lg bg-black/30 border border-white/5">
                <Info size={12} className="text-accent-cyan shrink-0 mt-0.5" />
                <p className="text-[11px] text-text-secondary italic leading-relaxed">
                  {node.returnExplanation}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Call Stack Path */}
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-accent-purple">
            <History size={14} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Call Stack Path</span>
          </div>
          <div className="space-y-1 relative pl-4 border-l border-white/10">
            {/* This would ideally be a trace back to root */}
            <div className="text-[10px] text-text-secondary py-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-purple" />
              <span>Root Call</span>
            </div>
            <div className="text-[10px] text-text-secondary py-1 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-purple/50" />
              <span>... intermediate calls</span>
            </div>
            <div className="text-[10px] text-text-primary font-bold py-1 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
              <span>Current: {node.name}</span>
            </div>
          </div>
        </section>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-background-secondary/50 flex gap-2">
        <button 
          className="flex-1 py-2 px-4 rounded-lg bg-accent-blue/10 hover:bg-accent-blue/20 border border-accent-blue/30 text-accent-blue text-[10px] font-bold uppercase tracking-wider transition-all"
          onClick={() => onJumpToNode?.(node.id)}
        >
          Center in View
        </button>
      </div>
    </motion.div>
  );
};
