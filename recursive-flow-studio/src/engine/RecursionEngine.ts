import { cloneDeep } from 'lodash';
import { RecursionNode, TraceAction, ExecutionMetrics, Language, EngineSettings } from '../types';

export class RecursionEngine {
  private nodes: Map<string, RecursionNode> = new Map();
  private callStack: string[] = [];
  private metrics: ExecutionMetrics;
  
  private maxDepthLimit = 100;
  private maxNodesLimit = 5000;
  private timeoutLimit = 10000; // 10s
  private startTime = 0;
  private nodeCounter = 0;

  constructor(config?: { maxDepth?: number; maxNodes?: number; timeout?: number }) {
    if (config?.maxDepth) this.maxDepthLimit = config.maxDepth;
    if (config?.maxNodes) this.maxNodesLimit = config.maxNodes;
    if (config?.timeout) this.timeoutLimit = config.timeout;
    this.metrics = this.resetMetrics();
  }

  private resetMetrics(lang: Language = 'javascript'): ExecutionMetrics {
    return {
      totalCalls: 0,
      maxDepth: 0,
      duplicates: 0,
      memoHits: 0,
      executionTime: 0,
      stackUsage: 0,
      memoryEstimate: 0,
      branchFactor: 0,
      language: lang
    };
  }

  public async run(code: string, entryFnName: string | null, args: any[], language: Language = 'javascript', settings?: EngineSettings): Promise<{ nodes: RecursionNode[]; metrics: ExecutionMetrics }> {
    this.nodes.clear();
    this.callStack = [];
    this.nodeCounter = 0;
    this.startTime = performance.now();
    this.metrics = this.resetMetrics(language);

    if (settings) {
      this.maxDepthLimit = settings.maxDepth;
      this.maxNodesLimit = settings.maxNodes;
      this.timeoutLimit = settings.timeout;
    }

    // Auto-detect entry function if not provided
    let detectedFnName = entryFnName;
    if (!detectedFnName) {
      detectedFnName = this.detectEntryFunction(code, language);
    }

    if (!detectedFnName) {
      throw new Error("Could not detect recursive function. Please specify one or use a standard pattern.");
    }

    if (language === 'javascript') {
      return this.runJavaScript(code, detectedFnName, args);
    } else {
      return this.simulateNonJS(code, detectedFnName, args, language);
    }
  }

  public detectFunctions(code: string, language: Language): string[] {
    const functionPatterns: Record<Language, RegExp[]> = {
      javascript: [
        /function\s+([a-zA-Z0-9_]+)\s*\(/g,
        /const\s+([a-zA-Z0-9_]+)\s*=\s*(?:function|\([^)]*\)\s*=>)/g
      ],
      python: [/def\s+([a-zA-Z0-9_]+)\s*\(/g],
      java: [/(?:public|private|protected|static|\s) +[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g],
      cpp: [/(?:[\w<>\[\]]+)\s+([a-zA-Z0-9_]+)\s*\(/g],
      csharp: [/(?:public|private|protected|static|\s) +[\w<>\[\]]+\s+([a-zA-Z0-9_]+)\s*\(/g]
    };

    const patterns = functionPatterns[language] || functionPatterns.javascript;
    const functions: string[] = [];
    
    for (const pattern of patterns) {
      const matches = Array.from(code.matchAll(pattern));
      for (const match of matches) {
        const name = match[1];
        if (name && !['if', 'for', 'while', 'switch', 'main'].includes(name)) {
          functions.push(name);
        }
      }
    }

    return Array.from(new Set(functions));
  }

  private detectEntryFunction(code: string, language: Language): string | null {
    const functions = this.detectFunctions(code, language);
    if (functions.length === 0) return null;
    if (functions.length === 1) return functions[0];

    // Score functions based on recursive calls
    const scores = functions.map(name => {
      const recursiveCallRegex = new RegExp(`${name}\\s*\\(`, 'g');
      const matches = code.match(recursiveCallRegex);
      return { name, score: matches ? matches.length : 0 };
    });

    scores.sort((a, b) => b.score - a.score);
    return scores[0].score > 1 ? scores[0].name : functions[0];
  }

  private async runJavaScript(code: string, entryFnName: string, args: any[]) {
    const tracker = {
      call: (name: string, fnArgs: any[]) => {
        if (this.nodes.size >= this.maxNodesLimit) throw new Error(`Max nodes limit (${this.maxNodesLimit}) exceeded.`);
        if (this.callStack.length >= this.maxDepthLimit) throw new Error(`Max recursion depth (${this.maxDepthLimit}) exceeded.`);
        if (performance.now() - this.startTime > this.timeoutLimit) throw new Error(`Execution timeout (${this.timeoutLimit}ms) exceeded.`);

        const parentId = this.callStack[this.callStack.length - 1] || null;
        const id = `node-${this.nodeCounter++}`;
        const depth = this.callStack.length;
        const callNumber = this.metrics.totalCalls + 1;

        const parent = parentId ? this.nodes.get(parentId) : null;
        const changedParams: Record<string, { from: any; to: any }> = {};
        
        if (parent) {
          // Detect changed parameters
          const parentArgs = parent.args as any[];
          fnArgs.forEach((arg, i) => {
            if (JSON.stringify(arg) !== JSON.stringify(parentArgs[i])) {
              changedParams[`param_${i}`] = { from: parentArgs[i], to: arg };
            }
          });
        }

        const node: RecursionNode = {
          id,
          name,
          args: cloneDeep(fnArgs),
          depth,
          callNumber,
          parentId,
          children: [],
          startTime: performance.now() - this.startTime,
          traceActions: [{
            type: 'call',
            message: `Calling ${name}(${fnArgs.join(', ')})`,
            timestamp: performance.now() - this.startTime
          }],
          stateSnapshot: {},
          language: 'javascript',
          state: 'active',
          changedParams
        };

        if (parentId) {
          const parentNode = this.nodes.get(parentId);
          if (parentNode) parentNode.children.push(id);
        }

        this.nodes.set(id, node);
        this.callStack.push(id);
        
        this.metrics.totalCalls++;
        this.metrics.maxDepth = Math.max(this.metrics.maxDepth, depth + 1);
        
        return id;
      },
      return: (id: string, result: any, isMemoized = false) => {
        const node = this.nodes.get(id);
        if (node) {
          node.endTime = performance.now() - this.startTime;
          node.executionTime = node.endTime - node.startTime;
          node.result = cloneDeep(result);
          node.isMemoized = isMemoized;
          node.state = isMemoized ? 'memoized' : (node.children.length === 0 ? 'base_case' : 'completed');
          
          let explanation = "";
          if (node.state === 'base_case') {
            explanation = "Base case reached";
          } else if (node.state === 'memoized') {
            explanation = "Result retrieved from memoization cache";
          } else {
            explanation = `Recursive calls completed, returning ${JSON.stringify(result)}`;
          }
          node.returnExplanation = explanation;

          node.traceActions.push({
            type: isMemoized ? 'memo_hit' : 'return',
            message: isMemoized ? `Memo hit for ${node.name}` : `Returning ${JSON.stringify(result)} from ${node.name}`,
            timestamp: performance.now() - this.startTime,
            data: result
          });
        }
        this.callStack.pop();
      },
      trace: (type: TraceAction['type'], message: string, data?: any) => {
        const currentId = this.callStack[this.callStack.length - 1];
        if (currentId) {
          const node = this.nodes.get(currentId);
          if (node) {
            node.traceActions.push({
              type,
              message,
              timestamp: performance.now() - this.startTime,
              data: cloneDeep(data)
            });
          }
        }
      }
    };

    try {
      // Find all function names to instrument them
      const functionNames = Array.from(code.matchAll(/(?:function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:function|\([^)]*\)\s*=>)|([a-zA-Z0-9_]+)\s*:\s*(?:function|\([^)]*\)\s*=>))/g))
        .map(match => match[1] || match[2] || match[3])
        .filter(name => name && name !== 'tracker' && name !== 'choose' && name !== 'backtrack' && name !== 'log');

      // To fix the Depth=1 bug, we MUST wrap the functions BEFORE they are called.
      // We'll use a wrapper that redefines the function in the local scope.
      const sandbox = new Function('tracker', 'args', 'cloneDeep', `
        const __tracker = tracker;
        const __wrap = (fn, name) => {
          const wrapped = (...fnArgs) => {
            const id = __tracker.call(name, fnArgs);
            try {
              const result = fn(...fnArgs);
              __tracker.return(id, result);
              return result;
            } catch (e) {
              __tracker.trace('log', 'Error in ' + name + ': ' + e.message);
              throw e;
            }
          };
          return wrapped;
        };

        const choose = (msg, data) => __tracker.trace('choose', msg, data);
        const backtrack = (msg, data) => __tracker.trace('backtrack', msg, data);
        const log = (msg, data) => __tracker.trace('log', msg, data);

        // We need to make sure the functions are available for wrapping.
        // We'll use 'var' to allow redefinition.
        ${code.replace(/const\s+([a-zA-Z0-9_]+)\s*=/g, 'var $1 =').replace(/let\s+([a-zA-Z0-9_]+)\s*=/g, 'var $1 =')}

        // Redefine functions to be wrapped
        ${functionNames.map(name => `
          if (typeof ${name} === 'function') {
            const original_${name} = ${name};
            ${name} = (...args) => wrapped_${name}(...args);
            var wrapped_${name} = __wrap(original_${name}, '${name}');
          }
        `).join('\n')}
        
        if (typeof ${entryFnName} !== 'function') {
          throw new Error("Function '${entryFnName}' not found.");
        }

        return ${entryFnName}(...args);
      `);

      await sandbox(tracker, args, cloneDeep);
    } catch (error: any) {
      console.error("Recursion Engine Error:", error);
      throw error;
    }

    this.calculateFinalMetrics();
    
    return {
      nodes: Array.from(this.nodes.values()),
      metrics: this.metrics
    };
  }

  private simulateNonJS(code: string, entryFnName: string, args: any[], language: Language) {
    const id = `node-${this.nodeCounter++}`;
    const root: RecursionNode = {
      id,
      name: entryFnName,
      args: cloneDeep(args),
      depth: 0,
      callNumber: 1,
      parentId: null,
      children: [],
      startTime: 0,
      traceActions: [],
      stateSnapshot: {},
      language,
      state: 'active'
    };
    this.nodes.set(id, root);
    this.metrics.totalCalls = 1;

    // Syntax-aware simulation: Detect recursive calls in code
    const recursiveCallRegex = new RegExp(`${entryFnName}\\s*\\(`, 'g');
    const matches = code.match(recursiveCallRegex);
    const branchingFactor = matches ? Math.max(1, matches.length - 1) : 1;

    const name = entryFnName.toLowerCase();
    if (name.includes('fib')) {
      this.simulateFib(root, args[0] || 5);
    } else if (name.includes('fact')) {
      this.simulateFact(root, args[0] || 5);
    } else if (name.includes('search')) {
      this.simulateBinarySearch(root, args[0] || [1, 2, 3, 4, 5], args[1] || 3, args[2] || 0, args[3] || 4);
    } else if (name.includes('subset') || name.includes('combination') || name.includes('permutation') || branchingFactor > 2) {
      this.simulateBacktracking(root, 3);
    } else {
      this.simulateGeneric(root, 3, branchingFactor);
    }

    this.calculateFinalMetrics();

    return {
      nodes: Array.from(this.nodes.values()),
      metrics: this.metrics
    };
  }

  private simulateBinarySearch(parent: RecursionNode, arr: any[], target: any, left: number, right: number) {
    if (left > right) {
      parent.result = -1;
      parent.state = 'base_case';
      parent.returnExplanation = "Base case: left > right, target not found";
      return;
    }

    const mid = Math.floor((left + right) / 2);
    parent.localVariables = { mid };

    if (arr[mid] === target) {
      parent.result = mid;
      parent.state = 'base_case';
      parent.returnExplanation = `Base case: arr[${mid}] == target, found at index ${mid}`;
      return;
    }

    const childId = `node-${this.nodeCounter++}`;
    const nextLeft = arr[mid] > target ? left : mid + 1;
    const nextRight = arr[mid] > target ? mid - 1 : right;

    const changedParams: Record<string, { from: any; to: any }> = {};
    if (nextLeft !== left) changedParams['left'] = { from: left, to: nextLeft };
    if (nextRight !== right) changedParams['right'] = { from: right, to: nextRight };

    const child: RecursionNode = {
      id: childId,
      name: parent.name,
      args: [arr, target, nextLeft, nextRight],
      depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id,
      children: [],
      startTime: 0,
      traceActions: [],
      stateSnapshot: {},
      language: parent.language,
      state: 'active',
      changedParams
    };

    this.nodes.set(childId, child);
    parent.children.push(childId);
    this.simulateBinarySearch(child, arr, target, nextLeft, nextRight);
    
    parent.result = child.result;
    parent.state = 'completed';
    parent.returnExplanation = `Returning result from child call: ${child.result}`;
  }

  private simulateFib(parent: RecursionNode, n: number) {
    if (n <= 1) {
      parent.result = n;
      parent.state = 'base_case';
      return;
    }
    
    const leftId = `node-${this.nodeCounter++}`;
    const left: RecursionNode = {
      id: leftId, name: parent.name, args: [n - 1], depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id, children: [], startTime: 0,
      traceActions: [], stateSnapshot: {}, language: parent.language, state: 'active'
    };
    this.nodes.set(leftId, left);
    parent.children.push(leftId);
    this.simulateFib(left, n - 1);

    const rightId = `node-${this.nodeCounter++}`;
    const right: RecursionNode = {
      id: rightId, name: parent.name, args: [n - 2], depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id, children: [], startTime: 0,
      traceActions: [], stateSnapshot: {}, language: parent.language, state: 'active'
    };
    this.nodes.set(rightId, right);
    parent.children.push(rightId);
    this.simulateFib(right, n - 2);

    parent.result = (left.result || 0) + (right.result || 0);
    parent.state = 'completed';
  }

  private simulateFact(parent: RecursionNode, n: number) {
    if (n <= 1) {
      parent.result = 1;
      parent.state = 'base_case';
      return;
    }
    const childId = `node-${this.nodeCounter++}`;
    const child: RecursionNode = {
      id: childId, name: parent.name, args: [n - 1], depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id, children: [], startTime: 0,
      traceActions: [], stateSnapshot: {}, language: parent.language, state: 'active'
    };
    this.nodes.set(childId, child);
    parent.children.push(childId);
    this.simulateFact(child, n - 1);
    parent.result = n * (child.result || 1);
    parent.state = 'completed';
  }

  private simulateBacktracking(parent: RecursionNode, depth: number) {
    if (depth <= 0 || this.nodes.size > 100) {
      parent.state = 'base_case';
      return;
    }
    
    // Simulate "Pick"
    const pickId = `node-${this.nodeCounter++}`;
    const pick: RecursionNode = {
      id: pickId, name: parent.name, args: ['pick'], depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id, children: [], startTime: 0,
      traceActions: [{ type: 'choose', message: 'Picking element', timestamp: 0 }],
      stateSnapshot: {}, language: parent.language, state: 'active'
    };
    this.nodes.set(pickId, pick);
    parent.children.push(pickId);
    this.simulateBacktracking(pick, depth - 1);

    // Simulate "Not Pick"
    const skipId = `node-${this.nodeCounter++}`;
    const skip: RecursionNode = {
      id: skipId, name: parent.name, args: ['skip'], depth: parent.depth + 1,
      callNumber: ++this.metrics.totalCalls,
      parentId: parent.id, children: [], startTime: 0,
      traceActions: [{ type: 'log', message: 'Skipping element', timestamp: 0 }],
      stateSnapshot: {}, language: parent.language, state: 'active'
    };
    this.nodes.set(skipId, skip);
    parent.children.push(skipId);
    this.simulateBacktracking(skip, depth - 1);
    parent.state = 'completed';
  }

  private simulateGeneric(parent: RecursionNode, depth: number, branch: number) {
    if (depth <= 0 || this.nodes.size > 100) {
      parent.state = 'base_case';
      return;
    }
    for (let i = 0; i < branch; i++) {
      const childId = `node-${this.nodeCounter++}`;
      const child: RecursionNode = {
        id: childId, name: parent.name, args: [`arg_${i}`], depth: parent.depth + 1,
        callNumber: ++this.metrics.totalCalls,
        parentId: parent.id, children: [], startTime: 0,
        traceActions: [], stateSnapshot: {}, language: parent.language, state: 'active'
      };
      this.nodes.set(childId, child);
      parent.children.push(childId);
      this.simulateGeneric(child, depth - 1, branch);
    }
    parent.state = 'completed';
  }

  private calculateFinalMetrics() {
    const nodes = Array.from(this.nodes.values());
    this.metrics.totalCalls = nodes.length;
    this.metrics.maxDepth = Math.max(...nodes.map(n => n.depth + 1), 0);
    this.metrics.executionTime = performance.now() - this.startTime;
    
    const nonLeafNodes = nodes.filter(n => n.children.length > 0);
    if (nonLeafNodes.length > 0) {
      const totalChildren = nodes.filter(n => n.parentId !== null).length;
      this.metrics.branchFactor = Number((totalChildren / nonLeafNodes.length).toFixed(2));
    }
  }
}
