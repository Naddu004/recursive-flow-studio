import * as d3 from 'd3';
import { RecursionNode } from '../types';

export interface LayoutNode extends d3.HierarchyPointNode<RecursionNode> {
  x: number;
  y: number;
}

export class LayoutEngine {
  public static calculateLayout(nodes: RecursionNode[], width: number, height: number) {
    if (nodes.length === 0) return { nodes: [], links: [] };

    const rootNode = nodes.find(n => n.parentId === null);
    if (!rootNode) return { nodes: [], links: [] };

    const hierarchy = d3.stratify<RecursionNode>()
      .id(d => d.id)
      .parentId(d => d.parentId)(nodes);

    // Calculate dynamic node size based on max label length
    const maxLabelLength = Math.max(...nodes.map(n => `${n.name}(${Object.values(n.args).join(', ')})`.length), 10);
    const nodeWidth = Math.max(200, maxLabelLength * 9); 
    const nodeHeight = 160; 

    const treeLayout = d3.tree<RecursionNode>()
      .nodeSize([nodeWidth, nodeHeight])
      .separation((a, b) => {
        // Increase separation for nodes with many children or large subtrees
        const baseSep = a.parent === b.parent ? 1.4 : 1.8;
        return baseSep;
      });

    const root = treeLayout(hierarchy);

    return {
      nodes: root.descendants(),
      links: root.links()
    };
  }
}
