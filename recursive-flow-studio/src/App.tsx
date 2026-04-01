import React, { useState, useEffect } from 'react';
import { Group as PanelGroup, Panel as ResizablePanel, Separator as PanelResizeHandle } from 'react-resizable-panels';
import { Sidebar } from './components/workspace/Sidebar';
import { Panel } from './components/workspace/Panel';
import { EditorPanel } from './components/workspace/EditorPanel';
import { TreeVisualizer } from './components/visualizer/TreeVisualizer';
import { useWorkspace, WorkspaceProvider } from './hooks/useWorkspace';
import { RecursionEngine } from './engine/RecursionEngine';
import { RecursionNode, ExecutionMetrics, Language } from './types';
import { ALGORITHM_SAMPLES } from './lib/samples';
import { ComplexityPanel } from './components/workspace/ComplexityPanel';
import { HelpPanel } from './components/workspace/HelpPanel';
import { NodeDetailsPanel } from './components/workspace/NodeDetailsPanel';
import { SettingsPanel } from './components/workspace/SettingsPanel';
import { ExportModal } from './components/workspace/ExportModal';
import { LayoutPresetsModal } from './components/workspace/LayoutPresetsModal';
import { ProblemLibrary } from './components/workspace/ProblemLibrary';
import { cn } from './lib/utils';
import { 
  Code2, 
  Network, 
  Activity, 
  Zap, 
  HelpCircle, 
  Terminal,
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  Share2,
  Settings as SettingsIcon,
  Pause,
  SkipBack,
  SkipForward
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { EngineSettings } from './types';

const DEFAULT_SETTINGS: EngineSettings = {
  maxDepth: 100,
  maxNodes: 5000,
  timeout: 10000,
  recursionGuard: true,
  infiniteRecursionDetection: true,
  autoLayout: true,
  showReturnFlow: true,
  showEdgeArrows: true,
  curvedEdges: true,
  collapseDepthThreshold: 5,
  nodeAnimation: true,
  defaultSpeed: 1,
  autoPlay: true,
  stepInterval: 1000,
  nodeGlowIntensity: 0.5,
  edgeThickness: 2,
  fontFamily: 'Fira Code',
  fontSize: 14,
  lineHeight: 1.5
};

const AppContent = () => {
  const { panels, setPanels, togglePanel, maximizePanel } = useWorkspace();
  const [selectedAlgo, setSelectedAlgo] = useState('fibonacci');
  const [code, setCode] = useState(ALGORITHM_SAMPLES.fibonacci.code);
  const [nodes, setNodes] = useState<RecursionNode[]>([]);
  const [metrics, setMetrics] = useState<ExecutionMetrics | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>('javascript');

  // New States for Studio Features
  const [selectedNode, setSelectedNode] = useState<RecursionNode | null>(null);
  const [showProblemLibrary, setShowProblemLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showLayoutPresets, setShowLayoutPresets] = useState(false);
  const [engineSettings, setEngineSettings] = useState<EngineSettings>(() => {
    const saved = localStorage.getItem('engine-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });
  const [playbackStep, setPlaybackStep] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [availableFunctions, setAvailableFunctions] = useState<string[]>([]);
  const [entryFunction, setEntryFunction] = useState<string | null>(null);

  useEffect(() => {
    const engine = new RecursionEngine();
    const fns = engine.detectFunctions(code, selectedLanguage);
    setAvailableFunctions(fns);
    if (fns.length > 0 && (!entryFunction || !fns.includes(entryFunction))) {
      setEntryFunction(fns[0]);
    }
  }, [code, selectedLanguage]);

  const applyLayoutPreset = (presetId: string) => {
    let newPanels = [...panels];
    switch (presetId) {
      case 'default':
        newPanels = [
          { id: 'editor', isVisible: true, isMaximized: false },
          { id: 'tree', isVisible: true, isMaximized: false },
          { id: 'metrics', isVisible: true, isMaximized: false },
          { id: 'complexity', isVisible: false, isMaximized: false },
          { id: 'help', isVisible: false, isMaximized: false },
          { id: 'output', isVisible: true, isMaximized: false },
        ];
        break;
      case 'full-tree':
        newPanels = panels.map(p => ({ ...p, isVisible: p.id === 'tree', isMaximized: p.id === 'tree' }));
        break;
      case 'editor-focus':
        newPanels = panels.map(p => ({ ...p, isVisible: ['editor', 'tree'].includes(p.id), isMaximized: false }));
        break;
      case 'debug-focus':
        newPanels = panels.map(p => ({ ...p, isVisible: ['editor', 'tree', 'metrics', 'output'].includes(p.id), isMaximized: false }));
        break;
      case 'teaching-mode':
        newPanels = panels.map(p => ({ ...p, isVisible: ['tree', 'help'].includes(p.id), isMaximized: false }));
        break;
    }
    setPanels(newPanels);
  };

  useEffect(() => {
    const sample = (ALGORITHM_SAMPLES as any)[selectedAlgo];
    if (sample) setCode(sample.code);
  }, [selectedAlgo]);

  // Playback Logic
  useEffect(() => {
    if (isPaused || !nodes.length || playbackStep >= nodes.length - 1) return;

    const timer = setTimeout(() => {
      setPlaybackStep(prev => prev + 1);
    }, 1000 / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPaused, playbackStep, nodes.length, playbackSpeed]);

  useEffect(() => {
    localStorage.setItem('engine-settings', JSON.stringify(engineSettings));
  }, [engineSettings]);

  const runEngine = async () => {
    setIsRunning(true);
    setError(null);
    setPlaybackStep(0);
    setIsPaused(false);
    try {
      const engine = new RecursionEngine();
      const lines = code.trim().split('\n');
      const lastLine = lines[lines.length - 1];
      const match = lastLine.match(/([a-zA-Z0-9_]+)\((.*)\)/);
      
      let fnName = entryFunction || undefined;
      let args: any[] = [];
      
      if (match) {
        fnName = match[1];
        try {
          const argsStr = match[2];
          args = argsStr.split(',').map(s => {
            const trimmed = s.trim();
            if (trimmed === 'true') return true;
            if (trimmed === 'false') return false;
            if (!isNaN(Number(trimmed)) && trimmed !== '') return Number(trimmed);
            if (trimmed.startsWith('"') || trimmed.startsWith("'")) return trimmed.slice(1, -1);
            return trimmed;
          }).filter(s => s !== '');
        } catch (e) {
          args = [];
        }
      }
      
      const result = await engine.run(code, fnName || null, args, selectedLanguage, engineSettings);
      setNodes(result.nodes);
      setMetrics(result.metrics);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsRunning(false);
    }
  };

  const handleToggleCollapse = (nodeId: string) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, isCollapsed: !node.isCollapsed } : node
    ));
  };

  const handleSelectProblem = (problem: any) => {
    setCode(problem.code);
    setSelectedAlgo(problem.id);
    setShowProblemLibrary(false);
  };

  const getPanel = (id: string) => panels.find(p => p.id === id);

  const visibleNodes = nodes.slice(0, playbackStep + 1);
  const activeNodeId = nodes[playbackStep]?.id;

  return (
    <div className="flex h-screen w-screen bg-background-primary text-text-primary overflow-hidden font-sans">
      <Sidebar onActionClick={(id) => {
        if (id === 'samples') setShowProblemLibrary(true);
        if (id === 'settings') setShowSettings(true);
        if (id === 'export') setShowExport(true);
        if (id === 'layouts') setShowLayoutPresets(true);
      }} />
      
      <main className="flex-1 flex flex-col min-w-0 bg-background-primary relative">
        {/* Overlays */}
        <AnimatePresence>
          {showProblemLibrary && (
            <motion.div 
              initial={{ x: -400 }}
              animate={{ x: 0 }}
              exit={{ x: -400 }}
              className="absolute inset-y-0 left-0 w-80 z-50 shadow-2xl border-r border-border-color"
            >
              <ProblemLibrary onSelect={handleSelectProblem} />
              <button 
                onClick={() => setShowProblemLibrary(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-background-card rounded-lg text-text-secondary hover:text-text-primary transition-colors"
              >
                <ChevronLeft size={18} />
              </button>
            </motion.div>
          )}

          {showSettings && (
            <SettingsPanel 
              settings={engineSettings} 
              onUpdate={setEngineSettings} 
              onClose={() => setShowSettings(false)} 
            />
          )}

          {showExport && (
            <ExportModal 
              containerId="recursion-tree-container"
              onClose={() => setShowExport(false)} 
            />
          )}

          {showLayoutPresets && (
            <LayoutPresetsModal 
              onSelect={applyLayoutPreset}
              onClose={() => setShowLayoutPresets(false)}
            />
          )}

          {selectedNode && (
            <NodeDetailsPanel 
              node={selectedNode} 
              onClose={() => setSelectedNode(null)}
              onJumpToNode={(id) => {
                console.log('Jumping to node:', id);
                // Implementation for centering node in view
              }}
            />
          )}
        </AnimatePresence>

        {/* Node Details Overlay */}
        <AnimatePresence>
          {selectedNode && (
            <motion.div 
              initial={{ x: 400 }}
              animate={{ x: 0 }}
              exit={{ x: 400 }}
              className="absolute inset-y-0 right-0 w-80 z-50 shadow-2xl"
            >
              <NodeDetailsPanel node={selectedNode} onClose={() => setSelectedNode(null)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Top Toolbar */}
        <header className="h-12 border-b border-border-color bg-background-secondary flex items-center justify-between px-4 shrink-0 z-20">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Language:</span>
              <select 
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value as Language)}
                className="bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue text-text-primary"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-widest">Algorithm:</span>
              <select 
                value={selectedAlgo}
                onChange={(e) => setSelectedAlgo(e.target.value)}
                className="bg-background-card border border-border-color rounded px-2 py-1 text-xs outline-none focus:border-accent-blue text-text-primary"
              >
                {Object.entries(ALGORITHM_SAMPLES).map(([id, sample]) => (
                  <option key={id} value={id}>{sample.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {nodes.length > 0 && (
              <div className="flex items-center gap-1 bg-background-card border border-border-color rounded-full px-2 py-1 mr-4">
                <button 
                  onClick={() => setPlaybackStep(Math.max(0, playbackStep - 1))}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <SkipBack size={14} />
                </button>
                <button 
                  onClick={() => setIsPaused(!isPaused)}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {isPaused ? <Play size={14} /> : <Pause size={14} />}
                </button>
                <button 
                  onClick={() => setPlaybackStep(Math.min(nodes.length - 1, playbackStep + 1))}
                  className="p-1 text-text-secondary hover:text-text-primary transition-colors"
                >
                  <SkipForward size={14} />
                </button>
                <div className="w-[1px] h-3 bg-border-color mx-1" />
                <span className="text-[10px] font-mono text-accent-blue px-1 uppercase tracking-tighter">
                  STEP {playbackStep + 1}/{nodes.length}
                </span>
                <div className="w-[1px] h-3 bg-border-color mx-1" />
                <select 
                  value={playbackSpeed}
                  onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  className="bg-transparent text-[10px] font-mono text-text-secondary outline-none cursor-pointer"
                >
                  <option value={0.5}>0.5x</option>
                  <option value={1}>1.0x</option>
                  <option value={2}>2.0x</option>
                  <option value={5}>5.0x</option>
                </select>
              </div>
            )}
            <div className="flex items-center gap-2 bg-background-card border border-border-color rounded px-2 py-1">
              <span className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Entry:</span>
              <select 
                value={entryFunction || ''}
                onChange={(e) => setEntryFunction(e.target.value)}
                className="bg-transparent text-[10px] font-mono text-accent-blue outline-none cursor-pointer"
              >
                {availableFunctions.map(fn => (
                  <option key={fn} value={fn} className="bg-background-secondary">{fn}</option>
                ))}
              </select>
            </div>
            <button 
              onClick={runEngine}
              disabled={isRunning}
              className={cn(
                "flex items-center gap-2 px-4 py-1.5 rounded text-xs font-bold transition-all shadow-lg",
                isRunning ? "bg-background-card text-text-secondary" : "bg-accent-blue text-white hover:bg-accent-blue/80 active:scale-95"
              )}
            >
              <Play size={14} fill={!isRunning ? "currentColor" : "none"} />
              {isRunning ? 'EXECUTING...' : 'RUN FLOW'}
            </button>
            <div className="h-6 w-[1px] bg-border-color mx-1" />
            <button 
              onClick={() => setShowExport(true)}
              className="p-2 hover:bg-background-card rounded text-text-secondary hover:text-text-primary transition-colors"
            >
              <Share2 size={16} />
            </button>
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 hover:bg-background-card rounded text-text-secondary hover:text-text-primary transition-colors"
            >
              <SettingsIcon size={16} />
            </button>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden">
          <PanelGroup orientation="vertical">
            <ResizablePanel defaultSize={75} minSize={30}>
              <PanelGroup orientation="horizontal">
                {getPanel('editor')?.isVisible && (
                  <ResizablePanel defaultSize={40} minSize={20}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="editor" 
                        title="Code Editor" 
                        icon={<Code2 size={14} />}
                        onClose={() => togglePanel('editor')}
                        onMaximize={() => maximizePanel('editor')}
                        isMaximized={getPanel('editor')?.isMaximized}
                      >
                        <EditorPanel 
                          code={code} 
                          onChange={setCode} 
                          language={selectedLanguage}
                          settings={engineSettings}
                          onUpdateSettings={setEngineSettings}
                        />
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}
                
                {getPanel('editor')?.isVisible && getPanel('tree')?.isVisible && (
                  <PanelResizeHandle className="w-1 bg-transparent hover:bg-accent-blue/30 transition-colors cursor-col-resize" />
                )}

                {getPanel('tree')?.isVisible && (
                  <ResizablePanel defaultSize={60} minSize={20}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="tree" 
                        title="Recursion Tree" 
                        icon={<Network size={14} />}
                        onClose={() => togglePanel('tree')}
                        onMaximize={() => maximizePanel('tree')}
                        isMaximized={getPanel('tree')?.isMaximized}
                      >
                        <div id="recursion-tree-container" className="h-full w-full">
                          <TreeVisualizer 
                            nodes={visibleNodes} 
                            activeNodeId={activeNodeId}
                            engineSettings={engineSettings}
                            onNodeClick={setSelectedNode}
                            onToggleCollapse={handleToggleCollapse}
                          />
                        </div>
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}

                {getPanel('complexity')?.isVisible && (
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="complexity" 
                        title="Complexity Analysis" 
                        icon={<Zap size={14} />}
                        onClose={() => togglePanel('complexity')}
                      >
                        <ComplexityPanel algorithmId={selectedAlgo} />
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}

                {getPanel('help')?.isVisible && (
                  <ResizablePanel defaultSize={30} minSize={20}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="help" 
                        title="Help Center" 
                        icon={<HelpCircle size={14} />}
                        onClose={() => togglePanel('help')}
                      >
                        <HelpPanel />
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}
              </PanelGroup>
            </ResizablePanel>

            {(getPanel('metrics')?.isVisible || getPanel('output')?.isVisible) && (
              <PanelResizeHandle className="h-1 bg-transparent hover:bg-accent-blue/30 transition-colors cursor-row-resize" />
            )}

            <ResizablePanel defaultSize={25} minSize={10}>
              <PanelGroup orientation="horizontal">
                {getPanel('metrics')?.isVisible && (
                  <ResizablePanel defaultSize={30} minSize={15}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="metrics" 
                        title="Execution Metrics" 
                        icon={<Activity size={14} />}
                        onClose={() => togglePanel('metrics')}
                      >
                        <div className="p-4 grid grid-cols-2 gap-y-6 gap-x-4">
                          <MetricItem label="Total Calls" value={metrics?.totalCalls || 0} />
                          <MetricItem label="Max Depth" value={metrics?.maxDepth || 0} />
                          <MetricItem label="Memo Hits" value={metrics?.memoHits || 0} />
                          <MetricItem label="Exec Time" value={`${metrics?.executionTime.toFixed(2) || 0}ms`} />
                          <MetricItem label="Stack Usage" value={`${metrics?.stackUsage || 0} calls`} />
                          <MetricItem label="Branching" value={metrics?.branchFactor || 0} />
                        </div>
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}

                {getPanel('metrics')?.isVisible && getPanel('output')?.isVisible && (
                  <PanelResizeHandle className="w-1 bg-transparent hover:bg-accent-blue/30 transition-colors cursor-col-resize" />
                )}

                {getPanel('output')?.isVisible && (
                  <ResizablePanel defaultSize={70} minSize={15}>
                    <div className="p-2 h-full">
                      <Panel 
                        id="output" 
                        title="Output Console" 
                        icon={<Terminal size={14} />}
                        onClose={() => togglePanel('output')}
                      >
                        <div className="p-4 font-mono text-xs overflow-y-auto h-full bg-background-primary">
                          {error ? (
                            <div className="flex items-start gap-2 text-accent-red bg-accent-red/10 p-3 rounded border border-accent-red/20">
                              <Zap size={14} className="shrink-0 mt-0.5" />
                              <div>
                                <div className="font-bold mb-1 uppercase tracking-tighter">Runtime Error</div>
                                {error}
                              </div>
                            </div>
                          ) : nodes.length > 0 ? (
                            <div className="space-y-1">
                              <div className="text-accent-emerald font-bold mb-2 uppercase tracking-tighter">Execution Success</div>
                              {nodes.slice(0, 50).map((node, i) => (
                                <div key={node.id} className="text-text-secondary border-l border-border-color pl-2 ml-1">
                                  <span className="text-accent-blue">[{i}]</span> {node.name}({Object.values(node.args).join(', ')}) → <span className="text-accent-cyan">{JSON.stringify(node.result)}</span>
                                </div>
                              ))}
                              {nodes.length > 50 && <div className="text-text-secondary italic opacity-50">... and {nodes.length - 50} more calls</div>}
                            </div>
                          ) : (
                            <div className="text-text-secondary italic opacity-50 flex flex-col items-center justify-center h-full gap-2">
                              <Terminal size={24} className="opacity-20" />
                              Engine ready. Waiting for execution...
                            </div>
                          )}
                        </div>
                      </Panel>
                    </div>
                  </ResizablePanel>
                )}
              </PanelGroup>
            </ResizablePanel>
          </PanelGroup>
        </div>
      </main>

      {/* Modals & Overlays */}
      {showSettings && (
        <SettingsPanel 
          settings={engineSettings} 
          onUpdate={setEngineSettings} 
          onClose={() => setShowSettings(false)} 
        />
      )}

      {showExport && (
        <ExportModal 
          onClose={() => setShowExport(false)} 
          containerId="recursion-tree-container"
        />
      )}

      {showLayoutPresets && (
        <LayoutPresetsModal 
          onClose={() => setShowLayoutPresets(false)} 
          onSelect={applyLayoutPreset}
        />
      )}

      {showProblemLibrary && (
        <ProblemLibrary 
          onClose={() => setShowProblemLibrary(false)} 
          onSelect={(algo) => {
            setSelectedAlgo(algo);
            setShowProblemLibrary(false);
          }}
        />
      )}

      {selectedNode && (
        <NodeDetailsPanel 
          node={selectedNode} 
          onClose={() => setSelectedNode(null)} 
        />
      )}
    </div>
  );
};

const MetricItem = ({ label, value }: { label: string, value: any }) => (
  <div className="flex flex-col">
    <span className="text-[9px] font-bold text-text-secondary uppercase tracking-widest mb-1">{label}</span>
    <span className="text-xl font-mono font-medium text-accent-blue drop-shadow-[0_0_8px_rgba(59,130,246,0.3)]">{value}</span>
  </div>
);

export default function App() {
  return (
    <WorkspaceProvider>
      <AppContent />
    </WorkspaceProvider>
  );
}
