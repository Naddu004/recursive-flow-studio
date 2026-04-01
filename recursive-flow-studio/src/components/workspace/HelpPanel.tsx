import React from 'react';
import { HelpCircle, Book, Code, Zap, Info, Lightbulb } from 'lucide-react';

export const HelpPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-background-secondary overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent-blue">
            <Book size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest">How to use Recursive Flow</h3>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            Recursive Flow Studio is a powerful visualization tool for understanding recursive algorithms. 
            Write your code in the editor, ensure you have an entry call at the end, and hit <span className="text-accent-blue font-bold">RUN FLOW</span>.
          </p>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent-emerald">
            <Code size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Writing Recursive Functions</h3>
          </div>
          
          <div className="space-y-6">
            <div className="bg-background-card p-4 rounded-lg border border-border-color space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-text-primary">1. Single Function Recursion</h4>
              <p className="text-[10px] text-text-secondary">The most common pattern where a function calls itself.</p>
              <pre className="text-[10px] font-mono text-accent-blue bg-black/20 p-2 rounded">
                {`function fact(n) {
  if (n <= 1) return 1;
  return n * fact(n - 1);
}`}
              </pre>
            </div>

            <div className="bg-background-card p-4 rounded-lg border border-border-color space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-text-primary">2. Helper Recursion</h4>
              <p className="text-[10px] text-text-secondary">Using a nested helper function to maintain state.</p>
              <pre className="text-[10px] font-mono text-accent-blue bg-black/20 p-2 rounded">
                {`function subsets(nums) {
  const res = [];
  function backtrack(idx, path) {
    res.push([...path]);
    for(let i=idx; i<nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(0, []);
  return res;
}`}
              </pre>
            </div>

            <div className="bg-background-card p-4 rounded-lg border border-border-color space-y-2">
              <h4 className="text-[10px] font-bold uppercase text-text-primary">3. Mutual Recursion</h4>
              <p className="text-[10px] text-text-secondary">Two or more functions calling each other.</p>
              <pre className="text-[10px] font-mono text-accent-blue bg-black/20 p-2 rounded">
                {`function isEven(n) {
  if (n === 0) return true;
  return isOdd(n - 1);
}
function isOdd(n) {
  if (n === 0) return false;
  return isEven(n - 1);
}`}
              </pre>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent-orange">
            <Zap size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Language Specifics</h3>
          </div>
          <div className="grid grid-cols-1 gap-3">
            <LanguageTip lang="JavaScript" tip="Full runtime execution. Supports all JS features including closures and external libraries." />
            <LanguageTip lang="Python" tip="Syntax-aware simulation. Best for standard algorithms like Fibonacci, Factorial, and DFS." />
            <LanguageTip lang="C++ / Java / C#" tip="Static trace builder. Visualizes the recursive structure based on function calls and branching." />
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 text-accent-purple">
            <Lightbulb size={18} />
            <h3 className="text-sm font-bold uppercase tracking-widest">Pro Tips</h3>
          </div>
          <ul className="space-y-2">
            <li className="flex items-start gap-2 text-[10px] text-text-secondary">
              <div className="w-1 h-1 rounded-full bg-accent-purple mt-1.5 shrink-0" />
              <span>Use <code className="text-accent-blue">log(msg)</code> to add custom messages to node traces.</span>
            </li>
            <li className="flex items-start gap-2 text-[10px] text-text-secondary">
              <div className="w-1 h-1 rounded-full bg-accent-purple mt-1.5 shrink-0" />
              <span>Use <code className="text-accent-blue">choose(msg)</code> in backtracking to highlight decision points.</span>
            </li>
            <li className="flex items-start gap-2 text-[10px] text-text-secondary">
              <div className="w-1 h-1 rounded-full bg-accent-purple mt-1.5 shrink-0" />
              <span>Click any node to see a full parameters snapshot and what changed from parent.</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
};

const LanguageTip = ({ lang, tip }: { lang: string, tip: string }) => (
  <div className="p-3 bg-background-card border border-border-color rounded-lg">
    <div className="text-[10px] font-bold text-text-primary mb-1">{lang}</div>
    <div className="text-[10px] text-text-secondary leading-relaxed">{tip}</div>
  </div>
);
