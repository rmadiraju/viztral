import React, { useEffect, useRef, useState } from 'react';
import type { GraphNode, GraphEdge } from '../services/api';

interface RepositoryGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
  selectedNode?: GraphNode | null;
  viewMode: 'architecture' | 'module' | 'dependency' | 'conceptual' | 'mermaid';
}

const RepositoryGraph: React.FC<RepositoryGraphProps> = ({
  nodes,
  edges,
  onNodeClick,
  selectedNode,
  viewMode
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Color scheme for different node types
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'file': return '#3B82F6'; // blue
      case 'class': return '#10B981'; // green
      case 'function': return '#8B5CF6'; // purple
      case 'module': return '#F59E0B'; // amber
      case 'database': return '#EF4444'; // red
      case 'service': return '#06B6D4'; // cyan
      case 'repository': return '#6366F1'; // indigo
      default: return '#6B7280'; // gray
    }
  };

  // Filter nodes based on view mode
  const getFilteredNodes = () => {
    switch (viewMode) {
      case 'architecture':
        return nodes.filter(n => ['repository', 'module', 'service', 'database'].includes(n.type));
      case 'module':
        return nodes.filter(n => ['module', 'class', 'function'].includes(n.type));
      case 'dependency':
        return nodes.filter(n => n.type === 'file');
      case 'conceptual':
        return nodes.filter(n => ['repository', 'module', 'directory'].includes(n.type));
      case 'mermaid':
        return nodes.filter(n => ['repository', 'module', 'service', 'database'].includes(n.type));
      default:
        return nodes;
    }
  };

  // Filter edges based on view mode
  const getFilteredEdges = () => {
    const filteredNodes = getFilteredNodes();
    const nodeIds = new Set(filteredNodes.map(n => n.id));
    
    return edges.filter(e => 
      nodeIds.has(e.src_id) && nodeIds.has(e.dst_id)
    );
  };

  // Conceptual layout for repository structure view
  const calculateConceptualLayout = (nodes: GraphNode[], edges: GraphEdge[], width: number, height: number) => {
    const positions = new Map<number, { x: number; y: number }>();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Find repository node (central node)
    const repoNode = nodes.find(n => n.type === 'repository');
    if (repoNode) {
      positions.set(repoNode.id, { x: centerX, y: centerY });
    }
    
    // Position supporting elements above (Virtualized Environment, Scripts, Documentation)
    const supportingNodes = nodes.filter(n => ['module', 'directory'].includes(n.type));
    const topSpacing = 120;
    const topStartX = centerX - (supportingNodes.length - 1) * 80;
    
    supportingNodes.forEach((node, index) => {
      positions.set(node.id, {
        x: topStartX + index * 160,
        y: centerY - topSpacing
      });
    });
    
    // Position operational elements below (COBOL Categories, Reusable Code, etc.)
    const operationalNodes = nodes.filter(n => n.type === 'directory' && n.path && n.path.includes('/'));
    const bottomSpacing = 150;
    const bottomStartX = centerX - (operationalNodes.length - 1) * 100;
    
    operationalNodes.forEach((node, index) => {
      positions.set(node.id, {
        x: bottomStartX + index * 200,
        y: centerY + bottomSpacing
      });
    });
    
    return positions;
  };

  // Draw conceptual node with group box styling
  const drawConceptualNode = (ctx: CanvasRenderingContext2D, node: GraphNode, pos: { x: number; y: number }) => {
    const isRepository = node.type === 'repository';
    const isGroup = node.type === 'directory' || node.type === 'module';
    
    if (isRepository) {
      // Draw central repository node (larger, blue)
      ctx.fillStyle = '#3B82F6';
      ctx.fillRect(pos.x - 40, pos.y - 20, 80, 40);
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - 40, pos.y - 20, 80, 40);
      
      // Draw label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, pos.x, pos.y);
      
    } else if (isGroup) {
      // Draw group box with yellow border
      const width = 120;
      const height = 60;
      
      // Draw group background
      ctx.fillStyle = '#FEF3C7';
      ctx.fillRect(pos.x - width/2, pos.y - height/2, width, height);
      
      // Draw group border
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.strokeRect(pos.x - width/2, pos.y - height/2, width, height);
      
      // Draw label
      ctx.fillStyle = '#92400E';
      ctx.font = 'bold 10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, pos.x, pos.y);
      
    } else {
      // Draw regular node
      const color = getNodeColor(node.type);
      const size = 12;
      
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw label
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '10px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, pos.x, pos.y);
    }
  };

  // Simple force-directed layout
  const calculateLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
    const positions = new Map<number, { x: number; y: number }>();
    const width = 800;
    const height = 600;
    
    if (viewMode === 'conceptual') {
      return calculateConceptualLayout(nodes, edges, width, height);
    }
    
    // Initialize positions in a circle
    nodes.forEach((node, index) => {
      const angle = (index / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      positions.set(node.id, {
        x: width / 2 + radius * Math.cos(angle),
        y: height / 2 + radius * Math.sin(angle)
      });
    });

    // Simple force simulation (simplified)
    for (let iteration = 0; iteration < 50; iteration++) {
      const forces = new Map<number, { x: number; y: number }>();
      
      // Initialize forces
      nodes.forEach(node => {
        forces.set(node.id, { x: 0, y: 0 });
      });

      // Apply repulsion between all nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const pos1 = positions.get(node1.id)!;
          const pos2 = positions.get(node2.id)!;
          
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = 1000 / (distance * distance);
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            forces.get(node1.id)!.x += fx;
            forces.get(node1.id)!.y += fy;
            forces.get(node2.id)!.x -= fx;
            forces.get(node2.id)!.y -= fy;
          }
        }
      }

      // Apply attraction along edges
      edges.forEach(edge => {
        const pos1 = positions.get(edge.src_id);
        const pos2 = positions.get(edge.dst_id);
        
        if (pos1 && pos2) {
          const dx = pos1.x - pos2.x;
          const dy = pos1.y - pos2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            const force = (distance - 100) * 0.01;
            const fx = (dx / distance) * force;
            const fy = (dy / distance) * force;
            
            forces.get(edge.src_id)!.x -= fx;
            forces.get(edge.src_id)!.y -= fy;
            forces.get(edge.dst_id)!.x += fx;
            forces.get(edge.dst_id)!.y += fy;
          }
        }
      });

      // Apply forces
      nodes.forEach(node => {
        const pos = positions.get(node.id)!;
        const force = forces.get(node.id)!;
        
        pos.x += force.x * 0.1;
        pos.y += force.y * 0.1;
        
        // Keep nodes within bounds
        pos.x = Math.max(50, Math.min(width - 50, pos.x));
        pos.y = Math.max(50, Math.min(height - 50, pos.y));
      });
    }

    return positions;
  };

  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const rect = canvas.getBoundingClientRect();
    
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const filteredNodes = getFilteredNodes();
    const filteredEdges = getFilteredEdges();
    const positions = calculateLayout(filteredNodes, filteredEdges);

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw edges
    ctx.strokeStyle = '#94A3B8';
    ctx.lineWidth = 1;
    filteredEdges.forEach(edge => {
      const sourcePos = positions.get(edge.src_id);
      const targetPos = positions.get(edge.dst_id);
      
      if (sourcePos && targetPos) {
        ctx.beginPath();
        ctx.moveTo(sourcePos.x, sourcePos.y);
        ctx.lineTo(targetPos.x, targetPos.y);
        ctx.stroke();
      }
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const pos = positions.get(node.id);
      if (!pos) return;

      if (viewMode === 'conceptual') {
        drawConceptualNode(ctx, node, pos);
      } else {
        const color = getNodeColor(node.type);
        const size = node.type === 'repository' ? 20 : node.type === 'module' ? 16 : 12;

        // Draw node
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, size, 0, 2 * Math.PI);
        ctx.fill();

        // Draw selection border
        if (selectedNode?.id === node.id) {
          ctx.strokeStyle = '#F59E0B';
          ctx.lineWidth = 3;
          ctx.stroke();
        } else {
          ctx.strokeStyle = '#FFFFFF';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Draw label
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const label = node.name.length > 12 ? node.name.substring(0, 12) + '...' : node.name;
        ctx.fillText(label, pos.x, pos.y);
      }
    });

    ctx.restore();
  }, [nodes, edges, viewMode, selectedNode, zoom, pan]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onNodeClick) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left - pan.x) / zoom;
    const y = (event.clientY - rect.top - pan.y) / zoom;

    const filteredNodes = getFilteredNodes();
    const positions = calculateLayout(filteredNodes, getFilteredEdges());

    // Find clicked node
    for (const node of filteredNodes) {
      const pos = positions.get(node.id);
      if (pos) {
        const distance = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
        const size = node.type === 'repository' ? 20 : node.type === 'module' ? 16 : 12;
        
        if (distance <= size) {
          onNodeClick(node);
          break;
        }
      }
    }
  };

  const handleWheel = (event: React.WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  if (nodes.length === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <p className="text-sm">No repository data available</p>
          <p className="text-xs text-gray-400">Analyze a repository to see the graph</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full relative">
      {/* Graph Controls */}
      <div className="absolute top-4 right-4 z-10 flex space-x-2">
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 0, y: 0 });
          }}
          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Reset View
        </button>
        <button
          onClick={() => setZoom(prev => Math.min(3, prev * 1.2))}
          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Zoom In
        </button>
        <button
          onClick={() => setZoom(prev => Math.max(0.1, prev * 0.8))}
          className="px-3 py-1 bg-white border border-gray-300 rounded-md text-xs font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          Zoom Out
        </button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <h4 className="text-xs font-medium text-gray-700 mb-2">Node Types</h4>
        <div className="space-y-1">
          {['repository', 'module', 'file', 'class', 'function', 'service', 'database'].map(type => (
            <div key={type} className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getNodeColor(type) }}
              ></div>
              <span className="text-xs text-gray-600 capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleCanvasClick}
        onWheel={handleWheel}
        style={{ cursor: 'grab' }}
      />

      {/* Instructions */}
      <div className="absolute top-4 left-4 z-10 bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-xs">
        <p className="text-xs text-blue-800">
          <strong>Tip:</strong> Click nodes to select, scroll to zoom, drag to pan
        </p>
      </div>
    </div>
  );
};

export default RepositoryGraph; 