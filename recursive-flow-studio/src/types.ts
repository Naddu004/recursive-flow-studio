export const DESIGN_TOKENS = {
  background: {
    primary: '#050505',
    secondary: '#0F0F0F',
    card: '#151515',
    accent: '#1A1A1A'
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#888888',
    muted: '#444444'
  },
  accent: {
    blue: '#3B82F6',
    purple: '#8B5CF6',
    emerald: '#10B981',
    cyan: '#06B6D4',
    amber: '#F59E0B',
    red: '#EF4444'
  },
  border: '#222222'
};

export type Language = 'javascript' | 'python' | 'cpp' | 'java' | 'csharp';

export type NodeState = 'active' | 'completed' | 'base_case' | 'memoized' | 'backtracking' | 'error';

export interface EngineSettings {
  // Recursion Limits
  maxDepth: number;
  maxNodes: number;
  timeout: number;
  recursionGuard: boolean;
  infiniteRecursionDetection: boolean;
  
  // Visualization
  autoLayout: boolean;
  showReturnFlow: boolean;
  showEdgeArrows: boolean;
  curvedEdges: boolean;
  collapseDepthThreshold: number;
  nodeAnimation: boolean;
  
  // Playback
  defaultSpeed: number;
  autoPlay: boolean;
  stepInterval: number;
  
  // Theme
  nodeGlowIntensity: number;
  edgeThickness: number;
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
}

export interface RecursionNode {
  id: string;
  name: string;
  args: Record<string, any> | any[];
  depth: number;
  callNumber: number;
  parentId: string | null;
  children: string[];
  startTime: number;
  endTime?: number;
  result?: any;
  isMemoized?: boolean;
  isError?: boolean;
  errorMessage?: string;
  traceActions: TraceAction[];
  stateSnapshot: any;
  language?: Language;
  state: NodeState;
  executionTime?: number;
  memoryEstimate?: number;
  isCollapsed?: boolean;
  totalDescendants?: number;
  // New fields for detailed node UI
  localVariables?: Record<string, any>;
  changedParams?: Record<string, { from: any; to: any }>;
  returnExplanation?: string;
}

export interface TraceAction {
  type: 'choose' | 'recurse' | 'backtrack' | 'pop' | 'log' | 'call' | 'return' | 'memo_hit';
  message: string;
  timestamp: number;
  data?: any;
}

export interface ExecutionMetrics {
  totalCalls: number;
  maxDepth: number;
  duplicates: number;
  memoHits: number;
  executionTime: number;
  stackUsage: number;
  memoryEstimate: number;
  branchFactor: number;
  language: Language;
}

export interface ProblemCategory {
  id: string;
  name: string;
  problems: Problem[];
}

export interface Problem {
  id: string;
  name: string;
  code: string;
  explanation: string;
  complexity: ComplexityResult;
}

export interface ComplexityResult {
  time: string;
  space: string;
  recurrence: string;
  explanation: string;
}

export type PanelId = 'editor' | 'tree' | 'metrics' | 'complexity' | 'help' | 'output' | 'compare';

export interface PanelState {
  id: PanelId;
  isVisible: boolean;
  isMaximized: boolean;
}
