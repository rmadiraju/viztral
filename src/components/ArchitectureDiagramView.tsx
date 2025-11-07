import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  Handle,
  Position,
  EdgeLabelRenderer,
  getBezierPath,
} from 'reactflow';
import type {
  Node as NodeType,
  Edge as EdgeType,
  Connection as ConnectionType,
  NodeTypes as NodeTypesType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Server, Database, Shield, Zap, Users, ShoppingCart, Bell, BarChart3, Edit3, Trash2, Plus, X, MessageSquare, Save } from 'lucide-react';
import { apiService } from '../services/api';
import type { ArchitectureDiagram } from '../services/api';

interface ArchitectureDiagramViewProps {
  username?: string;
  repo: string;
}

// Custom edge component with editable labels
const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, data }: any) => {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(data?.label || '');
  const [edgeType, setEdgeType] = useState(data?.type || 'API Call');

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const handleLabelClick = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    // Update edge data
    data?.onUpdate(id, { label, type: edgeType });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLabel(data?.label || '');
    setEdgeType(data?.type || 'API Call');
    setIsEditing(false);
  };

  const handleDelete = () => {
    data?.onDelete(id);
  };

  return (
    <>
            <path
        id={id}
        style={{
          ...style,
          strokeDasharray: '8,4', // Professional dotted pattern
          strokeWidth: 2,
          stroke: '#3B82F6' // Blue color for animated flow
        }}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {isEditing ? (
            <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-3 min-w-[200px]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-semibold text-gray-900 text-sm">Edit Connection</h4>
                <button
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-700"
                  title="Delete Connection"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Connection Type</label>
                  <select
                    value={edgeType}
                    onChange={(e) => setEdgeType(e.target.value)}
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  >
                    <option value="API Call">API Call</option>
                    <option value="Data Flow">Data Flow</option>
                    <option value="Event">Event</option>
                    <option value="Dependency">Dependency</option>
                    <option value="Integration">Integration</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={label}
                    onChange={(e) => setLabel(e.target.value)}
                    placeholder="Connection description..."
                    className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-1 mt-3">
                <button
                  onClick={handleCancel}
                  className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={handleLabelClick}
              className="bg-white border border-gray-300 rounded-lg px-2 py-1 cursor-pointer hover:bg-gray-50 group"
              title="Click to edit connection"
            >
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-3 h-3 text-blue-500" />
                <span className="text-xs font-medium text-gray-700">
                  {label || 'Click to add description'}
                </span>
                <Edit3 className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {edgeType && (
                <div className="text-xs text-gray-500 mt-1">
                  Type: {edgeType}
                </div>
              )}
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

// Custom node component for architecture services
const ServiceNode: React.FC<{ data: any; id: string }> = ({ data, id }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(data);

  const getIcon = (serviceType: string) => {
    switch (serviceType.toLowerCase()) {
      case 'api-gateway':
        return <Shield className="w-6 h-6 text-blue-600" />;
      case 'user':
        return <Users className="w-6 h-6 text-green-600" />;
      case 'payment':
        return <ShoppingCart className="w-6 h-6 text-purple-600" />;
      case 'order':
        return <ShoppingCart className="w-6 h-6 text-orange-600" />;
      case 'inventory':
        return <BarChart3 className="w-6 h-6 text-red-600" />;
      case 'notification':
        return <Bell className="w-6 h-6 text-yellow-600" />;
      case 'database':
        return <Database className="w-6 h-6 text-indigo-600" />;
      case 'monitoring':
        return <Zap className="w-6 h-6 text-teal-600" />;
      default:
        return <Server className="w-6 h-6 text-gray-600" />;
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowMenu(false);
  };

  const handleDelete = () => {
    data?.onDelete(id);
    setShowMenu(false);
  };

  const handleSave = () => {
    data?.onUpdate(id, editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(data);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white border-2 border-blue-200 rounded-lg shadow-lg p-4 min-w-[200px]">
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Service Name</label>
                         <input
               type="text"
               value={editData.label}
               onChange={(e) => setEditData((prev: any) => ({ ...prev, label: e.target.value }))}
               className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
             />
           </div>
           <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
             <textarea
               value={editData.description}
               onChange={(e) => setEditData((prev: any) => ({ ...prev, description: e.target.value }))}
               rows={2}
               className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
             />
           </div>
           <div>
             <label className="block text-xs font-medium text-gray-700 mb-1">Technology</label>
             <input
               type="text"
               value={editData.technology}
               onChange={(e) => setEditData((prev: any) => ({ ...prev, technology: e.target.value }))}
               className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
             />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleSave}
              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="px-2 py-1 text-xs text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] relative group">
      {/* Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-green-500 border-2 border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      {/* Context Menu Button */}
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-8 right-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[120px]">
          <button
            onClick={handleEdit}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit</span>
          </button>
          <button
            onClick={handleDelete}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}

      <div className="flex items-center mb-2">
        {getIcon(data.label)}
        <h3 className="ml-2 font-semibold text-gray-900">{data.label}</h3>
      </div>
      <p className="text-sm text-gray-600 mb-2">{data.description}</p>
      <div className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
        {data.technology}
      </div>
    </div>
  );
};

const nodeTypes: NodeTypesType = {
  service: ServiceNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const ArchitectureDiagramView: React.FC<ArchitectureDiagramViewProps> = ({ username, repo }) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDiagram();
  }, [username, repo]);

  const loadDiagram = async () => {
    try {
      setLoading(true);
      const diagram = await apiService.getArchitectureDiagram(username, repo);
      
      // Convert backend data to ReactFlow format
      const flowNodes: NodeType[] = diagram.nodes.map(node => ({
        ...node,
        type: 'service', // Use our custom node type
        data: {
          ...node.data,
          onUpdate: handleNodeUpdate,
          onDelete: handleNodeDelete,
        },
      }));

      const flowEdges: EdgeType[] = diagram.edges.map(edge => ({
        ...edge,
        type: 'custom', // Use our custom edge type
        animated: true, // Enable ReactFlow's built-in animation
        data: {
          ...edge.data,
          label: edge.label,
          onUpdate: handleEdgeUpdate,
          onDelete: handleEdgeDelete,
        },
      }));

      setNodes(flowNodes);
      setEdges(flowEdges);
    } catch (error) {
      console.error('Failed to load architecture diagram:', error);
      // Create default diagram if API fails
      const defaultNodes: NodeType[] = [
        {
          id: '1',
          type: 'service',
          position: { x: 250, y: 100 },
          data: {
            label: 'API Gateway',
            description: 'Entry point for all client requests',
            technology: 'Spring Cloud Gateway',
            onUpdate: handleNodeUpdate,
            onDelete: handleNodeDelete,
          },
        },
        {
          id: '2',
          type: 'service',
          position: { x: 100, y: 250 },
          data: {
            label: 'User Service',
            description: 'User management and authentication',
            technology: 'Spring Boot',
            onUpdate: handleNodeUpdate,
            onDelete: handleNodeDelete,
          },
        },
        {
          id: '3',
          type: 'service',
          position: { x: 400, y: 250 },
          data: {
            label: 'Order Service',
            description: 'Order processing and management',
            technology: 'Spring Boot',
            onUpdate: handleNodeUpdate,
            onDelete: handleNodeDelete,
          },
        },
        {
          id: '4',
          type: 'service',
          position: { x: 250, y: 400 },
          data: {
            label: 'Database',
            description: 'Primary data storage',
            technology: 'PostgreSQL',
            onUpdate: handleNodeUpdate,
            onDelete: handleNodeDelete,
          },
        },
      ];

      const defaultEdges: EdgeType[] = [
        {
          id: 'e1-2',
          source: '1',
          target: '2',
          type: 'custom',
          animated: true, // Enable ReactFlow's built-in animation
          data: {
            label: 'Authentication',
            type: 'API Call',
            onUpdate: handleEdgeUpdate,
            onDelete: handleEdgeDelete,
          },
        },
        {
          id: 'e1-3',
          source: '1',
          target: '3',
          type: 'custom',
          animated: true, // Enable ReactFlow's built-in animation
          data: {
            label: 'Order Processing',
            type: 'API Call',
            onUpdate: handleEdgeUpdate,
            onDelete: handleEdgeDelete,
          },
        },
        {
          id: 'e2-4',
          source: '2',
          target: '4',
          type: 'custom',
          animated: true, // Enable ReactFlow's built-in animation
          data: {
            label: 'User Data',
            type: 'Data Flow',
            onUpdate: handleEdgeUpdate,
            onDelete: handleEdgeDelete,
          },
        },
        {
          id: 'e3-4',
          source: '3',
          target: '4',
          type: 'custom',
          animated: true, // Enable ReactFlow's built-in animation
          data: {
            label: 'Order Data',
            type: 'Data Flow',
            onUpdate: handleEdgeUpdate,
            onDelete: handleEdgeDelete,
          },
        },
      ];

      setNodes(defaultNodes);
      setEdges(defaultEdges);
    } finally {
      setLoading(false);
    }
  };

  const handleNodeUpdate = useCallback((nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...newData,
            },
          };
        }
        return node;
      })
    );
  }, [setNodes]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId));
  }, [setNodes, setEdges]);

  const handleEdgeUpdate = useCallback((edgeId: string, newData: any) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return {
            ...edge,
            data: {
              ...edge.data,
              ...newData,
            },
          };
        }
        return edge;
      })
    );
  }, [setEdges]);

  const handleEdgeDelete = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, [setEdges]);

  const onConnect = useCallback(
    (params: ConnectionType) => {
      if (!params.source || !params.target) return;
      
      const newEdge: EdgeType = {
        ...params,
        id: `e${params.source}-${params.target}`,
        type: 'custom',
        source: params.source,
        target: params.target,
        animated: true, // Enable ReactFlow's built-in animation
        data: {
          label: 'New Connection',
          type: 'API Call',
          onUpdate: handleEdgeUpdate,
          onDelete: handleEdgeDelete,
        },
      };
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges, handleEdgeUpdate, handleEdgeDelete]
  );

  const addNewNode = useCallback(() => {
    const newNode: NodeType = {
      id: `${Date.now()}`,
      type: 'service',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        label: 'New Service',
        description: 'Service description',
        technology: 'Technology stack',
        onUpdate: handleNodeUpdate,
        onDelete: handleNodeDelete,
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes, handleNodeUpdate, handleNodeDelete]);

  const saveDiagram = async () => {
    try {
      setSaving(true);
      
      // Convert ReactFlow data back to backend format
      const diagram: ArchitectureDiagram = {
        repo,
        nodes: nodes.map(node => ({
          id: node.id,
          type: node.type || 'default',
          position: node.position,
          data: {
            label: node.data.label,
            description: node.data.description,
            technology: node.data.technology,
          },
        })),
        edges: edges.map(edge => ({
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: edge.type || 'default',
          label: edge.data?.label || '',
          data: edge.data,
        })),
        version: '1.0',
        last_updated: new Date().toISOString(),
      };
      
      await apiService.saveArchitectureDiagram(username, repo, diagram);
    } catch (error) {
      console.error('Failed to save architecture diagram:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading architecture diagram...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* ReactFlow Diagram */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative" style={{ height: '600px' }}>
          {/* Custom Top Right Controls */}
          <div className="absolute top-4 right-4 z-10 flex flex-col space-y-2">
            <button
              onClick={addNewNode}
              className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 shadow-lg"
              title="Add New Service"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={saveDiagram}
              disabled={saving}
              title={saving ? "Saving..." : "Save Diagram"}
              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 shadow-lg"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
            </button>
          </div>

          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              fitView
              attributionPosition="bottom-left"
              ref={reactFlowWrapper}
            >
              <Controls position="bottom-left" />
              <Background />
              <MiniMap />
            </ReactFlow>
          </ReactFlowProvider>
        </div>
      </div>
    </div>
  );
};

export default ArchitectureDiagramView; 