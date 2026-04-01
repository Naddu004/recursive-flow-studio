import React from 'react';
import { PROBLEM_LIBRARY } from '../../lib/problemLibrary';
import { Problem, ProblemCategory } from '../../types';
import { BookOpen, ChevronRight, Zap, Clock, Database, Code2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ProblemLibraryProps {
  onSelect: (problem: Problem) => void;
}

export const ProblemLibrary: React.FC<ProblemLibraryProps> = ({ onSelect }) => {
  return (
    <div className="flex flex-col h-full bg-background-primary overflow-hidden">
      <div className="p-4 border-b border-border-color bg-background-secondary/50">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen size={16} className="text-accent-blue" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-text-primary">Problem Library</h2>
        </div>
        <p className="text-[10px] text-text-secondary uppercase tracking-tighter">Select a recursive pattern to visualize</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {PROBLEM_LIBRARY.map((category) => (
          <div key={category.id} className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-4 bg-accent-blue rounded-full" />
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">{category.name}</h3>
            </div>
            
            <div className="grid gap-2">
              {category.problems.map((problem) => (
                <button
                  key={problem.id}
                  onClick={() => onSelect(problem)}
                  className="group flex flex-col p-3 rounded-xl bg-background-secondary border border-border-color hover:border-accent-blue/50 hover:bg-accent-blue/5 transition-all text-left relative overflow-hidden"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-text-primary group-hover:text-accent-blue transition-colors">
                      {problem.name}
                    </span>
                    <ChevronRight size={14} className="text-text-secondary group-hover:translate-x-1 transition-transform" />
                  </div>
                  
                  <p className="text-xs text-text-secondary line-clamp-2 mb-3 leading-relaxed">
                    {problem.explanation}
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-accent-purple">
                      <Zap size={10} />
                      <span>{problem.complexity.time}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-mono text-accent-amber">
                      <Database size={10} />
                      <span>{problem.complexity.space}</span>
                    </div>
                  </div>

                  {/* Hover Accent */}
                  <div className="absolute top-0 left-0 w-1 h-full bg-accent-blue transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border-color bg-background-secondary/30">
        <div className="flex items-center gap-2 text-[10px] text-text-secondary italic">
          <Code2 size={12} />
          <span>More problems coming soon...</span>
        </div>
      </div>
    </div>
  );
};
