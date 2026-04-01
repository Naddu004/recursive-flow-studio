import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { RecursionNode, EngineSettings } from '../../types';
import { LayoutEngine } from '../../engine/LayoutEngine';
import { motion, AnimatePresence } from 'motion/react';
import { DESIGN_TOKENS, cn } from '../../lib/utils';
import { ZoomIn, ZoomOut, Maximize, RotateCcw, MousePointer2, Move, Network } from 'lucide-react';

interface TreeVisualizerProps {
  nodes: RecursionNode[];
  activeNodeId?: string;
  engineSettings: EngineSettings;
  onNodeClick?: (node: RecursionNode) => void;
  onToggleCollapse?: (nodeId: string) => void;
}

export const TreeVisualizer: React.FC<TreeVisualizerProps> = ({ 
  nodes, 
  activeNodeId, 
  engineSettings,
  onNodeClick,
  onToggleCollapse
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [zoomState, setZoomState] = useState({ k: 1, x: 0, y: 0 });
  const [isAutoLayout, setIsAutoLayout] = useState(true);
  const [layoutData, setLayoutData] = useState<{ nodes: any[], links: any[] }>({ nodes: [], links: [] });
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const updateLayout = useCallback(() => {
    if (nodes.length === 0) return;
    // Filter out nodes that are children of collapsed nodes
    const visibleNodes = nodes.filter(node => {
      let current = node;
      while (current.parentId) {
        const parent = nodes.find(n => n.id === current.parentId);
        if (parent?.isCollapsed) return false;
        if (!parent) break;
        current = parent;
      }
      return true;
    });

    const data = LayoutEngine.calculateLayout(visibleNodes, 800, 600);
    setLayoutData(data);
    setIsAutoLayout(true);
  }, [nodes]);

  useEffect(() => {
    updateLayout();
  }, [updateLayout]);

  useEffect(() => {
    if (!svgRef.current || layoutData.nodes.length === 0) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.05, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomState(event.transform);
      });

    zoomBehaviorRef.current = zoom;
    svg.call(zoom);

    if (isAutoLayout) {
      // Fit view on initial load or auto-layout reset
      const bounds = g.node()?.getBBox();
      if (bounds && bounds.width > 0) {
        const fullWidth = svg.node()?.clientWidth || 800;
        const fullHeight = svg.node()?.clientHeight || 600;
        const width = bounds.width;
        const height = bounds.height;
        const midX = bounds.x + width / 2;
        const midY = bounds.y + height / 2;
        
        const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
        const transform = d3.zoomIdentity
          .translate(fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY)
          .scale(scale);
        
        svg.transition().duration(750).call(zoom.transform, transform);
      }
    }

    // Link generator with smooth Bezier curves
    const linkGen = d3.linkVertical<any, any>()
      .x(d => d.x)
      .y(d => d.y);

    // Draw links
    const linksSelection = g.selectAll('.link')
      .data(layoutData.links, (d: any) => `${d.source.id}-${d.target.id}`);

    linksSelection.exit().remove();

    linksSelection.enter()
      .append('path')
      .attr('class', 'link')
      .attr('fill', 'none')
      .attr('stroke', DESIGN_TOKENS.accent.blue)
      .attr('stroke-width', 2)
      .attr('opacity', 0.4)
      .merge(linksSelection as any)
      .transition()
      .duration(500)
      .attr('d', (d: any) => {
        const source = d.source;
        const target = d.target;
        // Premium curved path
        return `M${source.x},${source.y}C${source.x},${(source.y + target.y) / 2} ${target.x},${(source.y + target.y) / 2} ${target.x},${target.y}`;
      });

    // Draw return links
    if (engineSettings.showReturnFlow) {
      const returnLinks = layoutData.links.filter((d: any) => d.target.data.result !== undefined);
      const returnLinksSelection = g.selectAll('.return-link')
        .data(returnLinks, (d: any) => `return-${d.source.id}-${d.target.id}`);

      returnLinksSelection.exit().remove();

      returnLinksSelection.enter()
        .append('path')
        .attr('class', 'return-link')
        .attr('fill', 'none')
        .attr('stroke', DESIGN_TOKENS.accent.emerald)
        .attr('stroke-width', engineSettings.edgeThickness * 0.75)
        .attr('stroke-dasharray', '4,4')
        .attr('opacity', 0.6)
        .merge(returnLinksSelection as any)
        .transition()
        .duration(engineSettings.nodeAnimation ? 500 : 0)
        .attr('d', (d: any) => {
          const source = { x: d.target.x, y: d.target.y };
          const target = { x: d.source.x, y: d.source.y };
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // More curve
          return `M${source.x},${source.y} A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
        });
    } else {
      g.selectAll('.return-link').remove();
    }

    // Drag behavior for subtree dragging
    const drag = d3.drag<SVGGElement, any>()
      .on('start', function() {
        d3.select(this).raise();
        setIsAutoLayout(false);
      })
      .on('drag', function(event, d) {
        const dx = event.dx;
        const dy = event.dy;
        
        // Move the node and all its descendants
        const subtree = d.descendants();
        subtree.forEach((node: any) => {
          node.x += dx;
          node.y += dy;
        });

        // Update the visual elements
        updateVisuals();
      });

    const updateVisuals = () => {
      g.selectAll('.node-group').attr('transform', (d: any) => `translate(${d.x},${d.y})`);
      g.selectAll('.link').attr('d', (d: any) => {
        const source = d.source;
        const target = d.target;
        return `M${source.x},${source.y}C${source.x},${(source.y + target.y) / 2} ${target.x},${(source.y + target.y) / 2} ${target.x},${target.y}`;
      });
      if (engineSettings.showReturnFlow) {
        g.selectAll('.return-link').attr('d', (d: any) => {
          const source = { x: d.target.x, y: d.target.y };
          const target = { x: d.source.x, y: d.source.y };
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5;
          return `M${source.x},${source.y} A${dr},${dr} 0 0,1 ${target.x},${target.y}`;
        });
      }
    };

    // Draw nodes
    const nodesSelection = g.selectAll('.node-group')
      .data(layoutData.nodes, (d: any) => d.id);

    nodesSelection.exit().remove();

    const nodeEnter = nodesSelection.enter()
      .append('g')
      .attr('class', 'node-group')
      .attr('cursor', 'grab')
      .on('click', (event, d) => {
        if (event.defaultPrevented) return;
        onNodeClick?.(d.data);
      })
      .call(drag as any);

    // Node Card
    const nodeWidth = 200;
    const nodeHeight = 120;
    
    const card = nodeEnter.append('g')
      .attr('class', 'node-card');

    card.append('rect')
      .attr('width', nodeWidth)
      .attr('height', nodeHeight)
      .attr('x', -nodeWidth / 2)
      .attr('y', -nodeHeight / 2)
      .attr('rx', 16)
      .attr('fill', DESIGN_TOKENS.background.card)
      .attr('stroke-width', 2)
      .attr('class', 'node-rect shadow-xl');

    // Header bar (semantic color based on state)
    card.append('path')
      .attr('d', `M${-nodeWidth / 2 + 16},${-nodeHeight / 2} h${nodeWidth - 32} a16,16 0 0,1 16,16 v4 h${-nodeWidth} v-4 a16,16 0 0,1 16,-16 z`)
      .attr('class', 'node-header-bar');

    // Function Name & Args
    card.append('text')
      .attr('class', 'node-title')
      .attr('x', -nodeWidth / 2 + 16)
      .attr('y', -nodeHeight / 2 + 14)
      .attr('fill', DESIGN_TOKENS.text.primary)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', engineSettings.fontFamily);

    // Call Number & Depth
    card.append('text')
      .attr('class', 'node-meta')
      .attr('x', -nodeWidth / 2 + 16)
      .attr('y', -nodeHeight / 2 + 28)
      .attr('fill', DESIGN_TOKENS.text.secondary)
      .attr('font-size', '8px')
      .attr('font-family', engineSettings.fontFamily);

    // Parameters Section
    const paramsGroup = card.append('g')
      .attr('class', 'params-group')
      .attr('transform', `translate(${-nodeWidth / 2 + 16}, ${-nodeHeight / 2 + 40})`);

    paramsGroup.append('text')
      .attr('class', 'params-label')
      .attr('fill', DESIGN_TOKENS.text.secondary)
      .attr('font-size', '7px')
      .attr('font-weight', 'bold')
      .attr('text-transform', 'uppercase')
      .text('PARAMS');

    paramsGroup.append('text')
      .attr('class', 'params-values')
      .attr('y', 12)
      .attr('fill', DESIGN_TOKENS.text.primary)
      .attr('font-size', '9px')
      .attr('font-family', engineSettings.fontFamily);

    // Changes Indicator
    card.append('g')
      .attr('class', 'changes-indicator')
      .attr('transform', `translate(${nodeWidth / 2 - 16}, ${-nodeHeight / 2 + 40})`)
      .append('circle')
      .attr('r', 4)
      .attr('class', 'changes-dot');

    // Result Section
    const resultGroup = card.append('g')
      .attr('class', 'result-group')
      .attr('transform', `translate(${-nodeWidth / 2 + 16}, ${nodeHeight / 2 - 24})`);

    resultGroup.append('text')
      .attr('class', 'result-label')
      .attr('fill', DESIGN_TOKENS.text.secondary)
      .attr('font-size', '7px')
      .attr('font-weight', 'bold')
      .attr('text-transform', 'uppercase')
      .text('RETURN');

    resultGroup.append('text')
      .attr('class', 'node-result')
      .attr('y', 12)
      .attr('fill', DESIGN_TOKENS.accent.cyan)
      .attr('font-size', '10px')
      .attr('font-weight', 'bold')
      .attr('font-family', engineSettings.fontFamily);

    // Collapse Toggle
    const toggle = nodeEnter.append('g')
      .attr('class', 'node-toggle')
      .attr('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onToggleCollapse?.(d.id);
      });

    toggle.append('circle')
      .attr('r', 12)
      .attr('cy', nodeHeight / 2)
      .attr('fill', DESIGN_TOKENS.background.secondary)
      .attr('stroke', DESIGN_TOKENS.border)
      .attr('class', 'toggle-bg');

    toggle.append('text')
      .attr('class', 'toggle-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '4')
      .attr('font-size', '14px')
      .attr('font-weight', 'bold')
      .attr('fill', DESIGN_TOKENS.text.secondary);

    // Badge for collapsed descendants
    toggle.append('g')
      .attr('class', 'toggle-badge-group')
      .attr('transform', 'translate(16, 0)')
      .append('rect')
      .attr('rx', 4)
      .attr('height', 14)
      .attr('y', nodeHeight / 2 - 7)
      .attr('fill', DESIGN_TOKENS.accent.blue)
      .attr('opacity', 0.2)
      .attr('class', 'badge-bg');

    toggle.select('.toggle-badge-group')
      .append('text')
      .attr('class', 'toggle-badge')
      .attr('x', 4)
      .attr('dy', nodeHeight / 2 + 4)
      .attr('font-size', '8px')
      .attr('fill', DESIGN_TOKENS.accent.blue)
      .attr('font-weight', 'bold');

    const nodeUpdate = nodeEnter.merge(nodesSelection as any);
    
    nodeUpdate.transition()
      .duration(isAutoLayout && engineSettings.nodeAnimation ? 500 : 0)
      .attr('transform', (d: any) => `translate(${d.x},${d.y})`);

    const getStateColor = (state: string) => {
      switch (state) {
        case 'active': return DESIGN_TOKENS.accent.blue;
        case 'completed': return DESIGN_TOKENS.accent.emerald;
        case 'base_case': return DESIGN_TOKENS.accent.cyan;
        case 'memoized': return DESIGN_TOKENS.accent.purple;
        case 'backtracking': return DESIGN_TOKENS.accent.amber;
        case 'error': return DESIGN_TOKENS.accent.red;
        default: return DESIGN_TOKENS.accent.blue;
      }
    };

    nodeUpdate.select('.node-rect')
      .attr('stroke', (d: any) => {
        if (d.id === activeNodeId) return DESIGN_TOKENS.accent.amber;
        return getStateColor(d.data.state);
      })
      .attr('stroke-dasharray', (d: any) => d.data.state === 'backtracking' ? '4,4' : 'none')
      .attr('filter', (d: any) => {
        if (d.id === activeNodeId) return 'drop-shadow(0 0 12px rgba(245, 158, 11, 0.6))';
        const intensity = engineSettings.nodeGlowIntensity;
        if (intensity > 0) {
          const color = getStateColor(d.data.state);
          return `drop-shadow(0 0 ${intensity * 10}px ${color})`;
        }
        return 'none';
      });

    nodeUpdate.select('.node-header-bar')
      .attr('fill', (d: any) => getStateColor(d.data.state))
      .attr('opacity', 0.2);

    nodeUpdate.select('.node-title')
      .text((d: any) => `${d.data.name}(${Object.values(d.data.args).join(', ')})`);

    nodeUpdate.select('.node-meta')
      .text((d: any) => `CALL: #${d.data.callNumber} | DEPTH: ${d.data.depth}`);

    nodeUpdate.select('.params-values')
      .text((d: any) => {
        const params = Object.entries(d.data.args)
          .map(([k, v]) => `${k}:${JSON.stringify(v)}`)
          .join(' ');
        return params.length > 25 ? params.substring(0, 22) + '...' : params;
      });

    nodeUpdate.select('.changes-dot')
      .attr('fill', DESIGN_TOKENS.accent.blue)
      .style('display', (d: any) => (d.data.changedParams?.length || 0) > 0 ? 'block' : 'none')
      .attr('opacity', (d: any) => (d.data.changedParams?.length || 0) > 0 ? 0.8 : 0);

    nodeUpdate.select('.node-result')
      .text((d: any) => d.data.result !== undefined ? JSON.stringify(d.data.result) : '...');

    nodeUpdate.select('.node-toggle')
      .style('display', (d: any) => d.data.children.length > 0 ? 'block' : 'none');

    nodeUpdate.select('.toggle-icon')
      .text((d: any) => d.data.isCollapsed ? '+' : '−');

    nodeUpdate.select('.toggle-badge')
      .text((d: any) => d.data.isCollapsed ? `${d.data.totalDescendants || 0} HIDDEN` : '');

    nodeUpdate.select('.badge-bg')
      .attr('width', (d: any) => d.data.isCollapsed ? 60 : 0)
      .style('display', (d: any) => d.data.isCollapsed ? 'block' : 'none');

    // Return Flow Edges
    if (engineSettings.showReturnFlow) {
      const returnEdges = nodes.filter(n => n.parentId !== null && n.returnValue !== undefined);
      
      const returnLines = g.append('g')
        .attr('class', 'return-lines')
        .selectAll('path')
        .data(returnEdges)
        .enter()
        .append('path')
        .attr('class', 'return-link')
        .attr('d', (d: any) => {
          const target = nodes.find(n => n.id === d.parentId);
          if (!target) return '';
          
          // Create a curved path back to parent
          const sourceX = d.x;
          const sourceY = d.y;
          const targetX = target.x;
          const targetY = target.y;
          
          const dx = targetX - sourceX;
          const dy = targetY - sourceY;
          const dr = Math.sqrt(dx * dx + dy * dy) * 1.5; // Curvature factor
          
          return `M${sourceX},${sourceY}A${dr},${dr} 0 0,1 ${targetX},${targetY}`;
        })
        .attr('fill', 'none')
        .attr('stroke', 'rgba(16, 185, 129, 0.5)') // Emerald/Green for return
        .attr('stroke-width', engineSettings.edgeThickness)
        .attr('stroke-dasharray', '4,4')
        .attr('marker-end', 'url(#arrowhead-return)')
        .style('opacity', (d: any) => {
          // Only show if the node is "active" or "completed" in playback
          const activeNode = nodes.find(n => n.id === activeNodeId);
          if (!activeNode) return 0.2;
          return d.id === activeNodeId || d.timestamp < (activeNode.timestamp || 0) ? 1 : 0.2;
        });

      // Add return value labels
      g.append('g')
        .attr('class', 'return-labels')
        .selectAll('text')
        .data(returnEdges)
        .enter()
        .append('text')
        .attr('x', (d: any) => {
          const target = nodes.find(n => n.id === d.parentId);
          return d.x + (target!.x - d.x) / 2 - 20;
        })
        .attr('y', (d: any) => {
          const target = nodes.find(n => n.id === d.parentId);
          return d.y + (target!.y - d.y) / 2;
        })
        .attr('dy', -10)
        .attr('text-anchor', 'middle')
        .attr('font-family', engineSettings.fontFamily)
        .attr('font-size', '10px')
        .attr('fill', '#10b981')
        .attr('font-weight', 'bold')
        .text((d: any) => `ret: ${d.returnValue}`)
        .style('opacity', (d: any) => {
          const activeNode = nodes.find(n => n.id === activeNodeId);
          if (!activeNode) return 0;
          return d.id === activeNodeId || d.timestamp < (activeNode.timestamp || 0) ? 1 : 0;
        });
    }

    // Add arrowheads to links
    svg.select('defs').remove();
    const defs = svg.append('defs');
    
    defs.append('marker')
      .attr('id', 'arrowhead')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', DESIGN_TOKENS.accent.blue);

    defs.append('marker')
      .attr('id', 'arrowhead-return')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 8)
      .attr('refY', 0)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', DESIGN_TOKENS.accent.emerald);

    g.selectAll('.link').attr('marker-end', 'url(#arrowhead)');
    g.selectAll('.return-link').attr('marker-end', 'url(#arrowhead-return)');

  }, [layoutData, activeNodeId, engineSettings, isAutoLayout, onNodeClick, onToggleCollapse]);

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    svg.transition().duration(300).call(zoomBehaviorRef.current.scaleBy, factor);
  };

  const handleReset = () => {
    updateLayout();
  };

  const handleFitView = () => {
    if (!svgRef.current || !gRef.current || !zoomBehaviorRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);
    const bounds = g.node()?.getBBox();
    if (bounds && bounds.width > 0) {
      const fullWidth = svg.node()?.clientWidth || 800;
      const fullHeight = svg.node()?.clientHeight || 600;
      const width = bounds.width;
      const height = bounds.height;
      const midX = bounds.x + width / 2;
      const midY = bounds.y + height / 2;
      
      const scale = 0.8 / Math.max(width / fullWidth, height / fullHeight);
      const transform = d3.zoomIdentity
        .translate(fullWidth / 2 - scale * midX, fullHeight / 2 - scale * midY)
        .scale(scale);
      
      svg.transition().duration(750).call(zoomBehaviorRef.current.transform, transform);
    }
  };

  return (
    <div className="w-full h-full bg-background-primary relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full outline-none">
        <g ref={gRef} />
      </svg>
      
      {/* Controls Overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <button 
          onClick={() => handleZoom(1.2)}
          className="p-2 glass rounded-lg hover:bg-accent-blue/20 transition-colors text-text-secondary hover:text-text-primary"
          title="Zoom In"
        >
          <ZoomIn size={18} />
        </button>
        <button 
          onClick={() => handleZoom(0.8)}
          className="p-2 glass rounded-lg hover:bg-accent-blue/20 transition-colors text-text-secondary hover:text-text-primary"
          title="Zoom Out"
        >
          <ZoomOut size={18} />
        </button>
        <button 
          onClick={handleFitView}
          className="p-2 glass rounded-lg hover:bg-accent-blue/20 transition-colors text-text-secondary hover:text-text-primary"
          title="Fit View"
        >
          <Maximize size={18} />
        </button>
        <button 
          onClick={handleReset}
          className="p-2 glass rounded-lg hover:bg-accent-blue/20 transition-colors text-text-secondary hover:text-text-primary"
          title="Restore Auto Layout"
        >
          <RotateCcw size={18} />
        </button>
      </div>

      {/* HUD Overlay */}
      <div className="absolute bottom-4 left-4 flex gap-2">
        <div className="glass px-3 py-1.5 rounded-lg text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-2">
          <Network size={12} className="text-accent-blue" />
          Nodes: {nodes.length}
        </div>
        <div className="glass px-3 py-1.5 rounded-lg text-[10px] text-text-secondary uppercase tracking-widest font-bold flex items-center gap-2">
          <Maximize size={12} className="text-accent-purple" />
          Zoom: {Math.round(zoomState.k * 100)}%
        </div>
        {!isAutoLayout && (
          <div className="glass px-3 py-1.5 rounded-lg text-[10px] text-accent-amber uppercase tracking-widest font-bold flex items-center gap-2 animate-pulse">
            <Move size={12} />
            Manual Mode
          </div>
        )}
      </div>
    </div>
  );
};
