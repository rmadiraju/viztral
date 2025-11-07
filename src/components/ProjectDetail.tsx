import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import ReactFlow, {
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Shield,
  Clock,
  Activity,
  Target,
  AlertTriangle,
  Database,
  Server,
  Network,
  Rocket,
  Calendar,
  Users,
  MapPin,
  Cloud,
  Timer,
  Download,
  ArrowRight,
  Code,
  Loader2,
  XCircle,
} from 'lucide-react';

// BACKUP: Original Simple ServiceNode Component (kept for reference/rollback)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ServiceNodeBackup = ({ data }: { data: any }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'api': return 'bg-blue-500';
      case 'database': return 'bg-green-500';
      case 'aws': return 'bg-orange-500';
      case 'queue': return 'bg-purple-500';
      case 'gateway': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-4 h-4" />;
      case 'aws': return <Cloud className="w-4 h-4" />;
      case 'queue': return <Activity className="w-4 h-4" />;
      case 'gateway': return <Network className="w-4 h-4" />;
      default: return <Server className="w-4 h-4" />;
    }
  };

  return (
    <div className={`px-4 py-3 rounded-lg border-2 ${data.selected ? 'border-blue-500 shadow-lg' : 'border-gray-300'} bg-white min-w-[180px]`}>
      <Handle type="target" position={Position.Top} />
      <div className="flex items-center space-x-2 mb-2">
        <div className={`p-2 rounded ${getNodeColor(data.type)} text-white`}>
          {getIcon(data.type)}
        </div>
        <div className="flex-1">
          <div className="font-semibold text-sm text-gray-900">{data.label}</div>
          {data.awsService && (
            <div className="text-xs text-orange-600 font-medium">{data.awsService}</div>
          )}
        </div>
      </div>
      {data.metrics && (
        <div className="mt-2 space-y-1 text-xs text-gray-600 border-t pt-2">
          {data.metrics.latency && <div>p95: {data.metrics.latency}ms</div>}
          {data.metrics.errorRate !== undefined && <div>Error: {data.metrics.errorRate}%</div>}
          {data.metrics.costShare && <div>Cost: {data.metrics.costShare}%</div>}
          {data.metrics.deploys !== undefined && <div>Deploys: {data.metrics.deploys}/mo</div>}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

// Enhanced ServiceNode Component with Risk, Tech Debt, and Business Impact Indicators
const ServiceNode = ({ data }: { data: any }) => {
  const getNodeColor = (type: string) => {
    switch (type) {
      case 'api': return 'bg-blue-500';
      case 'database': return 'bg-green-500';
      case 'aws': return 'bg-orange-500';
      case 'queue': return 'bg-purple-500';
      case 'gateway': return 'bg-indigo-500';
      default: return 'bg-gray-500';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'database': return <Database className="w-5 h-5" />;
      case 'aws': return <Cloud className="w-5 h-5" />;
      case 'queue': return <Activity className="w-5 h-5" />;
      case 'gateway': return <Network className="w-5 h-5" />;
      default: return <Server className="w-5 h-5" />;
    }
  };

  // Calculate risk level based on node data
  const getRiskLevel = () => {
    const riskScore = (data.riskScore || 0);
    if (riskScore >= 70) return { level: 'Critical', color: 'red', bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700' };
    if (riskScore >= 50) return { level: 'High', color: 'orange', bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700' };
    if (riskScore >= 30) return { level: 'Medium', color: 'yellow', bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700' };
    return { level: 'Low', color: 'green', bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700' };
  };

  // Calculate tech debt level
  const getTechDebtLevel = () => {
    const techDebtScore = (data.techDebtScore || 0);
    if (techDebtScore >= 70) return { level: 'High', color: 'red', icon: '⚠️' };
    if (techDebtScore >= 50) return { level: 'Medium', color: 'orange', icon: '🔧' };
    return { level: 'Low', color: 'green', icon: '✓' };
  };

  // Calculate business impact level
  const getBusinessImpactLevel = () => {
    const businessImpact = (data.businessImpact || 0);
    if (businessImpact >= 80) return { level: 'Critical', color: 'purple', icon: '💼' };
    if (businessImpact >= 60) return { level: 'High', color: 'blue', icon: '📈' };
    return { level: 'Medium', color: 'gray', icon: '📊' };
  };

  const riskLevel = getRiskLevel();
  const techDebtLevel = getTechDebtLevel();
  const businessImpactLevel = getBusinessImpactLevel();

  // Determine border color based on highest priority indicator
  const getBorderColor = () => {
    if (riskLevel.level === 'Critical' || techDebtLevel.level === 'High') return 'border-red-400 border-2';
    if (riskLevel.level === 'High' || techDebtLevel.level === 'Medium') return 'border-orange-400 border-2';
    if (businessImpactLevel.level === 'Critical') return 'border-purple-400 border-2';
    return 'border-gray-300 border-2';
  };

  return (
    <div className={`px-4 py-3 rounded-lg ${getBorderColor()} ${riskLevel.bg} bg-white min-w-[200px] max-w-[220px] shadow-sm hover:shadow-md transition-shadow`}>
      <Handle type="target" position={Position.Top} style={{ background: '#6b7280', width: 8, height: 8 }} />
      
      {/* Header with Icon and Title */}
      <div className="flex items-start space-x-2 mb-2">
        <div className={`p-2 rounded-lg flex-shrink-0 ${getNodeColor(data.type)} text-white`}>
          {getIcon(data.type)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-gray-900 truncate">{data.label}</div>
          {data.awsService && (
            <div className="text-xs text-orange-600 font-medium mt-0.5 truncate">{data.awsService}</div>
          )}
        </div>
      </div>

      {/* Risk, Tech Debt, and Business Impact Badges */}
      <div className="flex flex-wrap gap-1 mb-2">
        {data.riskScore > 0 && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${riskLevel.bg} ${riskLevel.text} border ${riskLevel.border}`}>
            <AlertTriangle className="w-3 h-3 inline mr-0.5" />
            Risk: {riskLevel.level}
          </span>
        )}
        {data.techDebtScore > 0 && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-300`}>
            {techDebtLevel.icon} Tech Debt: {techDebtLevel.level}
          </span>
        )}
        {data.businessImpact > 0 && (
          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${businessImpactLevel.level === 'Critical' ? 'bg-purple-100 text-purple-700 border border-purple-300' : 'bg-blue-100 text-blue-700 border border-blue-300'}`}>
            {businessImpactLevel.icon} Impact: {businessImpactLevel.level}
          </span>
        )}
      </div>

      {/* Metrics */}
      {data.metrics && (
        <div className="mt-2 pt-2 border-t border-gray-200 space-y-1.5">
          {data.metrics.costShare !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Cost Share:</span>
              <span className="font-medium text-gray-900">{data.metrics.costShare}%</span>
            </div>
          )}
          {data.metrics.deploys !== undefined && (
            <div className="flex justify-between text-xs">
              <span className="text-gray-500">Deploys:</span>
              <span className="font-medium text-gray-900">{data.metrics.deploys}/mo</span>
            </div>
          )}
        </div>
      )}

      {/* Modernization Impact Indicator */}
      {data.modernizationImpact && (
        <div className="mt-2 pt-2 border-t border-green-200 bg-green-50 rounded px-2 py-1">
          <div className="flex items-center space-x-1 text-xs">
            <TrendingUp className="w-3 h-3 text-green-600" />
            <span className="font-medium text-green-700">Modernization Impact:</span>
            <span className="text-green-600 font-bold">{data.modernizationImpact}</span>
          </div>
        </div>
      )}

      <Handle type="source" position={Position.Bottom} style={{ background: '#6b7280', width: 8, height: 8 }} />
    </div>
  );
};

const nodeTypes = {
  service: ServiceNode,
};

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'current' | 'modern'>('current');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [approvalStatus, setApprovalStatus] = useState<'pending' | 'approved' | 'submitted'>('pending');

  // Allow CTO, Admin, Architect, and Developer to access project details
  if (user?.persona !== 'CTO' && user?.persona !== 'Admin' && user?.persona !== 'Architect' && user?.persona !== 'Developer') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this feature.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Decode project name from URL
  const projectName = projectId ? decodeURIComponent(projectId) : 'Unknown Project';

  // Dummy project data - in real app, this would come from API
  const projectData = useMemo(() => {
    const projects: { [key: string]: any } = {
      'Mainframe Payment System': {
        name: 'Mainframe Payment System',
        domain: 'Payments',
        owner: 'Sarah Johnson',
        health: 'B',
        priority: 9.2,
        sixR: 'Refactor',
        wave: 1,
        eta: '2024-06-15',
        readiness: 45,
        readinessBlockers: ['No CI gates', 'Coverage < 60%', 'DB tightly coupled'],
        legacyCriticality: 95,
        legacyCriticalityDetails: ['Runtime EOL: Java 8 (2025)', 'Vendor EoS: IBM Mainframe', 'Monolith size: 2.4M LOC', 'High coupling', 'On-prem deployment'],
        businessImpact: 98,
        businessImpactDetails: ['Revenue criticality: 95%', 'Process criticality: 98%', 'Regulatory: PCI-DSS, SOX'],
        cost: {
          monthly: 45000,
          unitCost: 0.12,
          wastePercent: 35,
          projectedSavings: 18000
        },
        risk: {
          criticalCVEs: 3,
          secretFindings: 12,
          policyDrift: 5
        },
        ideaToProd: {
          currentStage: 'Build',
          agingDays: 23,
          slaBreaches: 2
        },
        architecture: {
          approved: true,
          status: 'Approved',
          current: {
            "nodes": [
              {
                "id": "mainframe",
                "label": "Mainframe System",
                "type": "aws",
                "awsService": "EC2 Instance",
                "position": {
                  "x": 520,
                  "y": -212
                },
                "metrics": {
                  "latency": 500,
                  "errorRate": 1.2,
                  "costShare": 50
                },
                "riskScore": 85,
                "techDebtScore": 95,
                "businessImpact": 98,
                "modernizationImpact": "High"
              },
              {
                "id": "payment-api",
                "label": "Payment API",
                "type": "api",
                "position": {
                  "x": 524,
                  "y": 86
                },
                "metrics": {
                  "latency": 450,
                  "errorRate": 0.8,
                  "costShare": 35,
                  "deploys": 12
                },
                "riskScore": 65,
                "techDebtScore": 70,
                "businessImpact": 95,
                "modernizationImpact": "Critical"
              },
              {
                "id": "db-mainframe",
                "label": "Mainframe DB",
                "type": "database",
                "position": {
                  "x": 538,
                  "y": 454
                },
                "metrics": {
                  "latency": 120,
                  "errorRate": 0.2,
                  "costShare": 40,
                  "deploys": 0
                },
                "riskScore": 75,
                "techDebtScore": 80,
                "businessImpact": 90,
                "modernizationImpact": "High"
              },
              {
                "id": "notification",
                "label": "Notification",
                "type": "api",
                "position": {
                  "x": 854,
                  "y": 394
                },
                "metrics": {
                  "latency": 200,
                  "errorRate": 0.5,
                  "costShare": 10,
                  "deploys": 4
                },
                "riskScore": 25,
                "techDebtScore": 30,
                "businessImpact": 50,
                "modernizationImpact": "Low"
              },
              {
                "id": "s3-storage",
                "label": "File Storage",
                "type": "aws",
                "awsService": "S3",
                "position": {
                  "x": 862,
                  "y": 726
                },
                "metrics": {
                  "costShare": 5
                },
                "riskScore": 10,
                "techDebtScore": 15,
                "businessImpact": 30,
                "modernizationImpact": "Low"
              },
              {
                "id": "auth-service",
                "label": "Auth Service",
                "type": "api",
                "position": {
                  "x": 162,
                  "y": 426
                },
                "metrics": {
                  "latency": 80,
                  "errorRate": 0.1,
                  "costShare": 15,
                  "deploys": 8
                },
                "riskScore": 40,
                "techDebtScore": 45,
                "businessImpact": 75,
                "modernizationImpact": "Medium"
              }
            ],
            "edges": [
              {
                "id": "e1",
                "source": "mainframe",
                "target": "payment-api",
                "label": "API Calls"
              },
              {
                "id": "e2",
                "source": "payment-api",
                "target": "db-mainframe",
                "label": "DB Queries"
              },
              {
                "id": "e3",
                "source": "payment-api",
                "target": "auth-service",
                "label": "Auth Check"
              },
              {
                "id": "e4",
                "source": "payment-api",
                "target": "notification",
                "label": "Notifications"
              },
              {
                "id": "e5",
                "source": "notification",
                "target": "s3-storage",
                "label": "Store Logs"
              }
            ]
          },
          modern: {
            "nodes": [
              {
                "id": "api-gateway",
                "label": "API Gateway",
                "type": "gateway",
                "awsService": "API Gateway",
                "position": {
                  "x": 396,
                  "y": -88
                },
                "metrics": {
                  "latency": 30,
                  "errorRate": 0.05,
                  "costShare": 10,
                  "deploys": 24
                }
              },
              {
                "id": "payment-api-v2",
                "label": "Payment API v2",
                "type": "api",
                "position": {
                  "x": 200,
                  "y": 110
                },
                "metrics": {
                  "latency": 150,
                  "errorRate": 0.2,
                  "costShare": 25,
                  "deploys": 48
                }
              },
              {
                "id": "postgres-db",
                "label": "Postgres DB",
                "type": "database",
                "awsService": "RDS PostgreSQL",
                "position": {
                  "x": 14,
                  "y": 332
                },
                "metrics": {
                  "latency": 50,
                  "errorRate": 0.05,
                  "costShare": 20,
                  "deploys": 0
                }
              },
              {
                "id": "auth-service-modern",
                "label": "Auth Service",
                "type": "api",
                "position": {
                  "x": 616,
                  "y": 102
                },
                "metrics": {
                  "latency": 50,
                  "errorRate": 0.05,
                  "costShare": 10,
                  "deploys": 48
                }
              },
              {
                "id": "message-bus",
                "label": "Message Bus",
                "type": "queue",
                "awsService": "SQS",
                "position": {
                  "x": 400,
                  "y": 350
                },
                "metrics": {
                  "latency": 100,
                  "errorRate": 0.1,
                  "costShare": 15,
                  "deploys": 0
                }
              },
              {
                "id": "notification-modern",
                "label": "Notification",
                "type": "api",
                "position": {
                  "x": 268,
                  "y": 532
                },
                "metrics": {
                  "latency": 100,
                  "errorRate": 0.2,
                  "costShare": 10,
                  "deploys": 48
                }
              },
              {
                "id": "s3-modern",
                "label": "Object Storage",
                "type": "aws",
                "awsService": "S3",
                "position": {
                  "x": 454,
                  "y": 808
                },
                "metrics": {
                  "costShare": 5
                }
              },
              {
                "id": "lambda-processor",
                "label": "Event Processor",
                "type": "aws",
                "awsService": "Lambda",
                "position": {
                  "x": 590,
                  "y": 540
                },
                "metrics": {
                  "latency": 50,
                  "errorRate": 0.1,
                  "costShare": 5
                }
              }
            ],
            "edges": [
              {
                "id": "e1",
                "source": "api-gateway",
                "target": "payment-api-v2",
                "label": "Routes"
              },
              {
                "id": "e2",
                "source": "api-gateway",
                "target": "auth-service-modern",
                "label": "Auth"
              },
              {
                "id": "e3",
                "source": "payment-api-v2",
                "target": "postgres-db",
                "label": "DB Queries"
              },
              {
                "id": "e4",
                "source": "payment-api-v2",
                "target": "message-bus",
                "label": "Publish"
              },
              {
                "id": "e5",
                "source": "message-bus",
                "target": "notification-modern",
                "label": "Consume"
              },
              {
                "id": "e6",
                "source": "message-bus",
                "target": "lambda-processor",
                "label": "Process"
              },
              {
                "id": "e7",
                "source": "notification-modern",
                "target": "s3-modern",
                "label": "Store"
              },
              {
                "id": "e8",
                "source": "lambda-processor",
                "target": "s3-modern",
                "label": "Store"
              }
            ]
          },
          deltas: ['DB split into microservices', 'Message bus introduced', 'API Gateway added']
        },
        dora: {
          deployFreq: 'Weekly',
          leadTime: '21 days',
          changeFailureRate: 8.5,
          mttr: '4.5 hours'
        },
        deliveryQuality: {
          prCycleTime: '3.2 days',
          flakyTests: 12,
          testCoverage: 58,
          testCoverageTrend: 5
        },
        costEfficiency: {
          byService: [
            { service: 'Payment API', prod: 18000, staging: 6000, dev: 3000 },
            { service: 'Transaction DB', prod: 12000, staging: 4000, dev: 2000 },
            { service: 'Auth Service', prod: 6000, staging: 2000, dev: 1000 },
            { service: 'Notification', prod: 3000, staging: 1000, dev: 500 }
          ],
          anomalies: 2,
          idleHours: 1200,
          riCoverage: 45,
          spCoverage: 25,
          whatIfSavings: 18000
        },
        risksBlockers: {
          eolClocks: [
            { component: 'Java 8 Runtime', eolDate: '2025-12-31', daysRemaining: 350 },
            { component: 'IBM Mainframe', eolDate: '2026-06-30', daysRemaining: 520 }
          ],
          dataResidency: ['EU customers require EU data storage', 'Compliance audit pending'],
          sharedDBs: ['Payment DB shared with 3 other services'],
          batchWindows: ['Critical batch jobs: 2am-4am daily'],
          changeFreezeWindows: ['Q4 freeze: Dec 15 - Jan 5']
        },
        modernizationPlan: {
          milestones: [
            { name: 'Architecture Design Approved', owner: 'Michael Chen', eta: '2024-04-15', confidence: 'High', status: 'completed' },
            { name: 'DB Migration Strategy', owner: 'Alex Rodriguez', eta: '2024-05-01', confidence: 'Medium', status: 'in_progress' },
            { name: 'API Gateway Implementation', owner: 'Emily Watson', eta: '2024-05-20', confidence: 'High', status: 'pending' },
            { name: 'Service Decomposition', owner: 'David Kim', eta: '2024-06-01', confidence: 'Medium', status: 'pending' },
            { name: 'Production Deployment', owner: 'Sarah Johnson', eta: '2024-06-15', confidence: 'High', status: 'pending' }
          ],
          aiPlan: {
            rationale: 'Refactor recommended due to high business value and technical feasibility. Step-by-step migration will minimize risk.',
            steps: [
              '1. Implement API Gateway for routing',
              '2. Extract authentication service first',
              '3. Migrate database to managed Postgres',
              '4. Decompose payment processing logic',
              '5. Implement message bus for async operations',
              '6. Gradual traffic shifting (10% → 50% → 100%)'
            ],
            rollbackPlan: 'Maintain parallel infrastructure for 30 days. Can revert to mainframe within 2 hours if issues arise.'
          }
        },
        funnel: {
          stages: [
            { name: 'Idea', sla: '7 days', wip: 2, rework: 0, stuckReasons: [] },
            { name: 'Design', sla: '14 days', wip: 3, rework: 1, stuckReasons: ['Awaiting security review'] },
            { name: 'Build', sla: '30 days', wip: 5, rework: 2, stuckReasons: ['Perf test slot unavailable'] },
            { name: 'Test', sla: '14 days', wip: 2, rework: 1, stuckReasons: [] },
            { name: 'Launch', sla: '7 days', wip: 1, rework: 0, stuckReasons: [] }
          ]
        }
      },
      // Other projects with pending architecture
      'Legacy ETL Pipeline': {
        name: 'Legacy ETL Pipeline',
        domain: 'Data',
        owner: 'Michael Chen',
        health: 'C',
        priority: 8.8,
        sixR: 'Replatform',
        wave: 2,
        eta: '2024-08-20',
        readiness: 65,
        readinessBlockers: ['No automated tests', 'Tight coupling'],
        legacyCriticality: 85,
        legacyCriticalityDetails: ['Runtime EOL: Python 2.7', 'On-prem deployment'],
        businessImpact: 75,
        businessImpactDetails: ['Process criticality: 75%'],
        cost: { monthly: 28000, unitCost: 0.08, wastePercent: 30, projectedSavings: 12000 },
        risk: { criticalCVEs: 2, secretFindings: 5, policyDrift: 3 },
        ideaToProd: { currentStage: 'Design', agingDays: 15, slaBreaches: 0 },
        architecture: {
          approved: false,
          status: 'Pending Approval',
          current: {
            nodes: [
              { id: 'etl-server', label: 'ETL Server', type: 'aws', position: { x: 400, y: 200 }, awsService: 'EC2', metrics: { latency: 600, errorRate: 1.5, costShare: 60 } },
              { id: 'source-db', label: 'Source DB', type: 'database', position: { x: 200, y: 400 }, metrics: { costShare: 25 } },
              { id: 'target-db', label: 'Target DB', type: 'database', position: { x: 600, y: 400 }, metrics: { costShare: 15 } },
            ],
            edges: [
              { id: 'e1', source: 'etl-server', target: 'source-db', label: 'Extract' },
              { id: 'e2', source: 'etl-server', target: 'target-db', label: 'Load' },
            ]
          },
          modern: {
            nodes: [],
            edges: []
          },
          deltas: []
        },
        dora: { deployFreq: 'Monthly', leadTime: '45 days', changeFailureRate: 15, mttr: '8 hours' },
        deliveryQuality: { prCycleTime: '5.5 days', flakyTests: 20, testCoverage: 35, testCoverageTrend: -2 },
        costEfficiency: { byService: [], anomalies: 1, idleHours: 800, riCoverage: 30, spCoverage: 10, whatIfSavings: 12000 },
        risksBlockers: { eolClocks: [], dataResidency: [], sharedDBs: [], batchWindows: ['Daily: 3am-5am'], changeFreezeWindows: [] },
        modernizationPlan: { milestones: [], aiPlan: { rationale: '', steps: [], rollbackPlan: '' } },
        funnel: { stages: [] }
      }
    };
    return projects[projectName] || projects['Mainframe Payment System'];
  }, [projectName]);

  // Update approval status when projectData changes
  useEffect(() => {
    if (projectData?.architecture?.approved) {
      setApprovalStatus('approved');
    } else {
      setApprovalStatus('pending');
    }
  }, [projectData]);

  // Handle node selection
  const handleNodeClick = (_event: React.MouseEvent, node: any) => {
    // Toggle selection - if clicking the same node, deselect it
    setSelectedNodeId(prev => prev === node.id ? null : node.id);
  };

  // Handle architecture approval (for Architect persona)
  const handleApproveArchitecture = async () => {
    try {
      // TODO: Call API to approve architecture
      setApprovalStatus('approved');
      alert('Architecture approved successfully!');
    } catch (error) {
      console.error('Failed to approve architecture:', error);
      alert('Failed to approve architecture. Please try again.');
    }
  };

  // Handle submit to engineer (for Architect persona)
  const handleSubmitToEngineer = async () => {
    try {
      // TODO: Call API to submit architecture to engineering team
      setApprovalStatus('submitted');
      alert('Architecture submitted to engineering team for development!');
    } catch (error) {
      console.error('Failed to submit architecture:', error);
      alert('Failed to submit architecture. Please try again.');
    }
  };

  // Handle code generation (for Developer persona)
  const handleGenerateCode = async (serviceName: string) => {
    setIsGeneratingCode(true);
    try {
      await apiService.generateCodeForService(serviceName);
      alert(`Code generation started for ${serviceName}. You will be notified when it's complete.`);
      setSelectedNodeId(null);
    } catch (error) {
      console.error('Failed to generate code:', error);
      alert('Failed to generate code. Please try again.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Get current or modern architecture based on view mode
  const currentArchitecture = useMemo(() => {
    if (viewMode === 'current') {
      return projectData.architecture.current;
    } else if (projectData.architecture.approved) {
      return projectData.architecture.modern;
    }
    return projectData.architecture.current;
  }, [viewMode, projectData]);

  const initialNodes = useMemo(() => {
    return currentArchitecture.nodes.map((node: any) => ({
      ...node,
      type: 'service',
      data: { ...node, selected: false }
    }));
  }, [currentArchitecture]);

  const initialEdges = useMemo(() => {
    return currentArchitecture.edges.map((edge: any) => {
      // Determine edge color based on risk - find source and target nodes
      const sourceNode = currentArchitecture.nodes.find((n: any) => n.id === edge.source);
      const targetNode = currentArchitecture.nodes.find((n: any) => n.id === edge.target);
      const maxRisk = Math.max(sourceNode?.riskScore || 0, targetNode?.riskScore || 0);
      
      let edgeColor = '#6b7280'; // default gray
      let edgeWidth = 2;
      if (viewMode === 'modern') {
        edgeColor = '#10b981'; // green for modern
      } else if (maxRisk >= 70) {
        edgeColor = '#ef4444'; // red for critical risk
        edgeWidth = 3;
      } else if (maxRisk >= 50) {
        edgeColor = '#f97316'; // orange for high risk
        edgeWidth = 2.5;
      }
      
      return {
        ...edge,
        animated: true,
        style: { 
          stroke: edgeColor,
          strokeWidth: edgeWidth
        },
        label: edge.label || '',
        labelStyle: { 
          fontSize: '11px', 
          fontWeight: 500,
          fill: edgeColor,
          background: 'white',
          padding: '2px 4px',
          borderRadius: '4px'
        }
      };
    });
  }, [currentArchitecture, viewMode]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when view mode or architecture changes
  React.useEffect(() => {
    const newNodes = currentArchitecture.nodes.map((node: any) => ({
      ...node,
      type: 'service',
      data: { ...node, selected: node.id === selectedNodeId }
    }));
    const newEdges = currentArchitecture.edges.map((edge: any) => {
      // Determine edge color based on risk
      const sourceNode = currentArchitecture.nodes.find((n: any) => n.id === edge.source);
      const targetNode = currentArchitecture.nodes.find((n: any) => n.id === edge.target);
      const maxRisk = Math.max(sourceNode?.riskScore || 0, targetNode?.riskScore || 0);
      
      let edgeColor = '#6b7280';
      let edgeWidth = 2;
      if (viewMode === 'modern') {
        edgeColor = '#10b981';
      } else if (maxRisk >= 70) {
        edgeColor = '#ef4444';
        edgeWidth = 3;
      } else if (maxRisk >= 50) {
        edgeColor = '#f97316';
        edgeWidth = 2.5;
      }
      
      return {
        ...edge,
        animated: true,
        style: { 
          stroke: edgeColor,
          strokeWidth: edgeWidth
        },
        label: edge.label || '',
        labelStyle: { 
          fontSize: '11px', 
          fontWeight: 500,
          fill: edgeColor,
          background: 'white',
          padding: '2px 4px',
          borderRadius: '4px'
        }
      };
    });
    setNodes(newNodes);
    setEdges(newEdges);
  }, [viewMode, currentArchitecture, selectedNodeId, setNodes, setEdges]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-yellow-100 text-yellow-800';
      case 'C': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 9) return 'bg-red-100 text-red-800';
    if (priority >= 8.5) return 'bg-orange-100 text-orange-800';
    return 'bg-yellow-100 text-yellow-800';
  };

  const isDeveloper = user?.persona === 'Developer';

  return (
    <div className={`${isDeveloper ? 'space-y-3' : 'space-y-6'}`}>
      {/* Back Button */}
      <button
        onClick={() => navigate('/dashboard?view=portfolio')}
        className={`flex items-center ${isDeveloper ? 'text-xs' : 'text-sm'} text-gray-600 hover:text-gray-900 transition-colors`}
      >
        <ArrowLeft className={`${isDeveloper ? 'w-3 h-3' : 'w-4 h-4'} mr-2`} />
        Back to Portfolio
      </button>

      {/* Header - Compact for Developers */}
      <div className={`bg-white rounded-xl ${isDeveloper ? 'p-3' : 'p-6'} shadow-sm border border-gray-200`}>
        <div className={`flex items-start justify-between ${isDeveloper ? 'mb-2' : 'mb-4'}`}>
          <div className="flex-1">
            <h1 className={`${isDeveloper ? 'text-xl' : 'text-3xl'} font-bold text-gray-900 ${isDeveloper ? 'mb-1' : 'mb-2'}`}>{projectData.name}</h1>
            <div className={`flex flex-wrap items-center ${isDeveloper ? 'gap-2 text-xs' : 'gap-4 text-sm'} text-gray-600`}>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span className="font-medium">Domain:</span>
                <span className="ml-1">{projectData.domain}</span>
              </div>
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                <span className="font-medium">Owner:</span>
                <span className="ml-1">{projectData.owner}</span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(projectData.health)}`}>
                  Health: {projectData.health}
                </span>
              </div>
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(projectData.priority)}`}>
                  Priority: {projectData.priority}
                </span>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 text-xs font-medium">
                  6R: {projectData.sixR}
                </span>
              </div>
              <div className="flex items-center">
                <span className="px-2 py-1 rounded bg-purple-100 text-purple-800 text-xs font-medium">
                  Wave {projectData.wave}
                </span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="font-medium">ETA:</span>
                <span className="ml-1">{projectData.eta}</span>
              </div>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Compare vs Target
          </button>
        </div>
      </div>

      {/* Service Graph with ReactFlow */}
      <div className={`bg-white rounded-xl ${isDeveloper ? 'p-3' : 'p-6'} shadow-sm border border-gray-200 ${isDeveloper ? 'relative' : ''}`}>
        {/* Sticky Generate Button for Developers */}
        {isDeveloper && selectedNodeId && (
          <div className="sticky top-0 z-10 mb-3 bg-blue-600 rounded-lg p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">
                  Selected: {nodes.find((n: any) => n.id === selectedNodeId)?.data?.label || selectedNodeId}
                </h3>
                <p className="text-xs text-blue-100 mt-0.5">Click Generate Code to start</p>
              </div>
              <button
                onClick={() => {
                  const selectedNode = nodes.find((n: any) => n.id === selectedNodeId);
                  if (selectedNode) {
                    handleGenerateCode(selectedNode.data?.label || selectedNodeId);
                  }
                }}
                disabled={isGeneratingCode}
                className="ml-4 px-4 py-2 bg-white text-blue-600 font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-50"
              >
                {isGeneratingCode ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Code className="w-4 h-4" />
                    <span>Generate Code</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setSelectedNodeId(null)}
                className="ml-2 text-white hover:text-blue-100"
                title="Clear selection"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
        <div className={`flex items-center justify-between ${isDeveloper ? 'mb-2' : 'mb-4'}`}>
          <div className="flex-1">
            <h2 className={`${isDeveloper ? 'text-base' : 'text-lg'} font-semibold text-gray-900`}>
              {viewMode === 'current' ? 'Hawk Eye' : 'Modern Architecture'} (Executive View)
            </h2>
            {viewMode === 'modern' && !projectData.architecture.approved && (
              <p className="text-sm text-orange-600 mt-1 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                Architecture Pending Approval
              </p>
            )}
            {viewMode === 'modern' && approvalStatus === 'approved' && (
              <p className="text-sm text-green-600 mt-1 flex items-center">
                <CheckCircle className="w-4 h-4 mr-1" />
                Architecture Approved
              </p>
            )}
            {viewMode === 'modern' && approvalStatus === 'submitted' && (
              <p className="text-sm text-blue-600 mt-1 flex items-center">
                <ArrowRight className="w-4 h-4 mr-1" />
                Submitted to Engineering Team
              </p>
            )}
          </div>
          <div className={`flex items-center space-x-2 ${isDeveloper ? 'hidden' : ''}`}>
            {/* Architect Actions - Show when viewing modern architecture */}
            {user?.persona === 'Architect' && viewMode === 'modern' && (
              <>
                {approvalStatus === 'pending' && (
                  <button
                    onClick={handleApproveArchitecture}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Approve Architecture</span>
                  </button>
                )}
                {approvalStatus === 'approved' && (
                  <button
                    onClick={handleSubmitToEngineer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <ArrowRight className="w-4 h-4" />
                    <span>Submit to Engineering</span>
                  </button>
                )}
              </>
            )}
            <button
              onClick={() => {
                // Export current ReactFlow state (with user modifications) as JSON
                const exportData = {
                  project: projectData.name,
                  viewMode: viewMode,
                  timestamp: new Date().toISOString(),
                  architecture: {
                    nodes: nodes.map((node: any) => ({
                      id: node.id,
                      label: node.data?.label || node.label,
                      type: node.data?.type || node.type,
                      awsService: node.data?.awsService,
                      position: node.position,
                      metrics: node.data?.metrics,
                      riskScore: node.data?.riskScore,
                      techDebtScore: node.data?.techDebtScore,
                      businessImpact: node.data?.businessImpact,
                      modernizationImpact: node.data?.modernizationImpact,
                    })),
                    edges: edges.map((edge: any) => ({
                      id: edge.id,
                      source: edge.source,
                      target: edge.target,
                      label: edge.label,
                    })),
                  },
                };
                
                const dataStr = JSON.stringify(exportData, null, 2);
                const dataBlob = new Blob([dataStr], { type: 'application/json' });
                const url = URL.createObjectURL(dataBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${projectData.name.replace(/\s+/g, '-')}-${viewMode}-architecture.json`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="hidden px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors flex items-center space-x-2"
              title="Download current architecture state as JSON (includes user modifications)"
            >
              <Download className="w-4 h-4" />
              <span>Download JSON</span>
            </button>
            <button
              onClick={() => setViewMode('current')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'current'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Current
            </button>
            <button
              onClick={() => setViewMode('modern')}
              disabled={!projectData.architecture.approved && projectData.name !== 'Mainframe Payment System'}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                viewMode === 'modern'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              } ${!projectData.architecture.approved && projectData.name !== 'Mainframe Payment System' ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={!projectData.architecture.approved && projectData.name !== 'Mainframe Payment System' ? 'Architecture not approved yet' : ''}
            >
              Modern
            </button>
          </div>
        </div>

        {/* Modernization Need Indicator */}
        {viewMode === 'current' && (() => {
          // Calculate modernization need score based on multiple factors
          const businessImpactWeight = 0.3;
          const legacyCriticalityWeight = 0.25;
          const riskWeight = 0.25;
          const costWasteWeight = 0.2;
          
          const businessImpactScore = projectData.businessImpact || 0;
          const legacyCriticalityScore = projectData.legacyCriticality || 0;
          const riskScore = Math.min(100, 
            ((projectData.risk?.criticalCVEs || 0) * 20) + 
            ((projectData.risk?.secretFindings || 0) * 3) + 
            ((projectData.risk?.policyDrift || 0) * 5)
          );
          const costWasteScore = projectData.cost?.wastePercent || 0;
          
          const modernizationNeedScore = Math.round(
            (businessImpactScore * businessImpactWeight) +
            (legacyCriticalityScore * legacyCriticalityWeight) +
            (riskScore * riskWeight) +
            (costWasteScore * costWasteWeight)
          );
          
          const getNeedLevel = (score: number) => {
            if (score >= 80) return { level: 'Critical', color: 'red', bgColor: 'bg-red-50', borderColor: 'border-red-200', textColor: 'text-red-800' };
            if (score >= 65) return { level: 'High', color: 'orange', bgColor: 'bg-orange-50', borderColor: 'border-orange-200', textColor: 'text-orange-800' };
            if (score >= 50) return { level: 'Medium', color: 'yellow', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200', textColor: 'text-yellow-800' };
            return { level: 'Low', color: 'green', bgColor: 'bg-green-50', borderColor: 'border-green-200', textColor: 'text-green-800' };
          };
          
          const needLevel = getNeedLevel(modernizationNeedScore);
          
          return (
            <div className={`mb-4 p-4 rounded-lg border-2 ${needLevel.bgColor} ${needLevel.borderColor}`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-5 h-5 ${needLevel.textColor}`} />
                  <h3 className={`font-semibold ${needLevel.textColor}`}>Modernization Need: {needLevel.level}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${needLevel.bgColor} ${needLevel.textColor} border ${needLevel.borderColor}`}>
                    Score: {modernizationNeedScore}/100
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-gray-600">Business Impact:</span>
                  <span className={`ml-1 font-medium ${businessImpactScore >= 80 ? 'text-red-600' : businessImpactScore >= 60 ? 'text-orange-600' : 'text-gray-700'}`}>
                    {businessImpactScore}% ({(businessImpactScore * businessImpactWeight).toFixed(0)} pts)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Legacy Criticality:</span>
                  <span className={`ml-1 font-medium ${legacyCriticalityScore >= 80 ? 'text-red-600' : legacyCriticalityScore >= 60 ? 'text-orange-600' : 'text-gray-700'}`}>
                    {legacyCriticalityScore}% ({(legacyCriticalityScore * legacyCriticalityWeight).toFixed(0)} pts)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Risk Factors:</span>
                  <span className={`ml-1 font-medium ${riskScore >= 60 ? 'text-red-600' : riskScore >= 40 ? 'text-orange-600' : 'text-gray-700'}`}>
                    {riskScore}% ({(riskScore * riskWeight).toFixed(0)} pts)
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Cost Waste:</span>
                  <span className={`ml-1 font-medium ${costWasteScore >= 30 ? 'text-orange-600' : costWasteScore >= 20 ? 'text-yellow-600' : 'text-gray-700'}`}>
                    {costWasteScore}% ({(costWasteScore * costWasteWeight).toFixed(0)} pts)
                  </span>
                </div>
              </div>
              <div className="mt-2 pt-2 border-t border-gray-300">
                <p className="text-xs text-gray-700">
                  <strong>Key Drivers:</strong> {
                    [
                      businessImpactScore >= 80 && 'High business impact',
                      legacyCriticalityScore >= 80 && 'Critical legacy system',
                      riskScore >= 50 && `${projectData.risk?.criticalCVEs || 0} critical CVEs, ${projectData.risk?.secretFindings || 0} secret findings`,
                      costWasteScore >= 25 && `High cost waste (${costWasteScore}%)`
                    ].filter(Boolean).join(' • ') || 'Moderate modernization drivers'
                  }
                </p>
              </div>
            </div>
          );
        })()}
        
        <div className="border border-gray-200 rounded-lg bg-gray-50" style={{ height: isDeveloper ? '500px' : '600px' }}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onNodeClick={handleNodeClick}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-left"
            >
              <Controls position="bottom-left" />
              <Background />
              <MiniMap 
                nodeColor={(node) => {
                  const colors: { [key: string]: string } = {
                    'api': '#3b82f6',
                    'database': '#10b981',
                    'aws': '#f97316',
                    'queue': '#8b5cf6',
                    'gateway': '#6366f1',
                  };
                  return colors[node.data?.type] || '#6b7280';
                }}
                position="bottom-right"
              />
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        
        {projectData.architecture.deltas && viewMode === 'modern' && projectData.architecture.approved && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-900 mb-1">Key Improvements:</p>
            <ul className="list-disc list-inside text-xs text-green-800 space-y-1">
              {projectData.architecture.deltas.map((delta: string, idx: number) => (
                <li key={idx}>{delta}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Overview Cards - Hidden for Developers */}
      {!isDeveloper && (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Readiness */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Readiness</h3>
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{projectData.readiness}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${projectData.readiness}%` }}></div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-700">Blockers:</p>
            {projectData.readinessBlockers.map((blocker: string, idx: number) => (
              <div key={idx} className="flex items-center text-xs text-gray-600">
                <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                {blocker}
              </div>
            ))}
          </div>
        </div>

        {/* Legacy Criticality */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Legacy Criticality</h3>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{projectData.legacyCriticality}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-red-600 h-2 rounded-full" style={{ width: `${projectData.legacyCriticality}%` }}></div>
          </div>
          <div className="space-y-1">
            {projectData.legacyCriticalityDetails.map((detail: string, idx: number) => (
              <div key={idx} className="text-xs text-gray-600">• {detail}</div>
            ))}
          </div>
        </div>

        {/* Business Impact */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Business Impact</h3>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">{projectData.businessImpact}%</div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-green-600 h-2 rounded-full" style={{ width: `${projectData.businessImpact}%` }}></div>
          </div>
          <div className="space-y-1">
            {projectData.businessImpactDetails.map((detail: string, idx: number) => (
              <div key={idx} className="text-xs text-gray-600">• {detail}</div>
            ))}
          </div>
        </div>

        {/* Cost */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Cost</h3>
            <DollarSign className="w-5 h-5 text-orange-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900 mb-1">${(projectData.cost.monthly / 1000).toFixed(0)}K/mo</div>
          <div className="text-sm text-gray-600 mb-3">
            Unit cost: ${projectData.cost.unitCost} | Waste: {projectData.cost.wastePercent}%
          </div>
          <div className="pt-3 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Projected Savings:</span>
              <span className="font-bold text-green-600">${(projectData.cost.projectedSavings / 1000).toFixed(0)}K/mo</span>
            </div>
          </div>
        </div>

        {/* Risk */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Risk</h3>
            <Shield className="w-5 h-5 text-red-600" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Critical CVEs:</span>
              <span className="font-bold text-red-600">{projectData.risk.criticalCVEs}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Secret Findings:</span>
              <span className="font-bold text-orange-600">{projectData.risk.secretFindings}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Policy Drift:</span>
              <span className="font-bold text-yellow-600">{projectData.risk.policyDrift}</span>
            </div>
          </div>
        </div>

        {/* Idea→Prod */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">Idea→Prod</h3>
            <Rocket className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-2">
            <div>
              <span className="text-sm text-gray-600">Current Stage:</span>
              <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">
                {projectData.ideaToProd.currentStage}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Aging Days:</span>
              <span className="font-bold text-gray-900">{projectData.ideaToProd.agingDays} days</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">SLA Breaches:</span>
              <span className="font-bold text-red-600">{projectData.ideaToProd.slaBreaches}</span>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Deep Sections - Hidden for Developers */}
      {!isDeveloper && (
      <div className="space-y-6">

        {/* Delivery & Quality */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Delivery & Quality</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Deploy Frequency</div>
              <div className="text-xl font-bold text-gray-900">{projectData.dora.deployFreq}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Lead Time</div>
              <div className="text-xl font-bold text-gray-900">{projectData.dora.leadTime}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Change Failure Rate</div>
              <div className="text-xl font-bold text-gray-900">{projectData.dora.changeFailureRate}%</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">MTTR</div>
              <div className="text-xl font-bold text-gray-900">{projectData.dora.mttr}</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">PR Cycle Time</div>
              <div className="text-lg font-bold text-gray-900">{projectData.deliveryQuality.prCycleTime}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="text-xs text-gray-600 mb-1">Flaky Tests</div>
              <div className="text-lg font-bold text-red-600">{projectData.deliveryQuality.flakyTests}</div>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-600 mb-1">Test Coverage</div>
                  <div className="text-lg font-bold text-gray-900">{projectData.deliveryQuality.testCoverage}%</div>
                </div>
                {projectData.deliveryQuality.testCoverageTrend > 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {projectData.deliveryQuality.testCoverageTrend > 0 ? '+' : ''}{projectData.deliveryQuality.testCoverageTrend}% trend
              </div>
            </div>
          </div>
        </div>

        {/* Cost & Efficiency */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cost & Efficiency</h2>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Service</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Production</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Staging</th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-gray-700">Development</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {projectData.costEfficiency.byService.map((item: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-2 font-medium text-gray-900">{item.service}</td>
                    <td className="px-4 py-2 text-right text-gray-700">${(item.prod / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-2 text-right text-gray-700">${(item.staging / 1000).toFixed(1)}K</td>
                    <td className="px-4 py-2 text-right text-gray-700">${(item.dev / 1000).toFixed(1)}K</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t border-gray-200">
            <div>
              <div className="text-xs text-gray-600 mb-1">Anomalies</div>
              <div className="text-lg font-bold text-orange-600">{projectData.costEfficiency.anomalies}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Idle Hours</div>
              <div className="text-lg font-bold text-gray-900">{projectData.costEfficiency.idleHours}</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">RI Coverage</div>
              <div className="text-lg font-bold text-gray-900">{projectData.costEfficiency.riCoverage}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">SP Coverage</div>
              <div className="text-lg font-bold text-gray-900">{projectData.costEfficiency.spCoverage}%</div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">What-if Savings</div>
              <div className="text-lg font-bold text-green-600">${(projectData.costEfficiency.whatIfSavings / 1000).toFixed(0)}K</div>
            </div>
          </div>
        </div>

        {/* Risks & Blockers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risks & Blockers</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <Timer className="w-4 h-4 mr-2 text-red-600" />
                EOL Clocks
              </h3>
              <div className="space-y-2">
                {projectData.risksBlockers.eolClocks.map((item: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium text-sm text-gray-900">{item.component}</div>
                      <div className="text-xs text-gray-600">EOL: {item.eolDate}</div>
                    </div>
                    <div className="text-sm font-bold text-red-600">{item.daysRemaining} days</div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-orange-600" />
                Data Residency
              </h3>
              <div className="space-y-1">
                {projectData.risksBlockers.dataResidency.map((item: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-700 p-2 bg-orange-50 border border-orange-200 rounded">• {item}</div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Shared DBs</h3>
                <div className="space-y-1">
                  {projectData.risksBlockers.sharedDBs.map((item: string, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-yellow-50 border border-yellow-200 rounded">• {item}</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Batch Windows</h3>
                <div className="space-y-1">
                  {projectData.risksBlockers.batchWindows.map((item: string, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-blue-50 border border-blue-200 rounded">• {item}</div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Change Freeze Windows</h3>
                <div className="space-y-1">
                  {projectData.risksBlockers.changeFreezeWindows.map((item: string, idx: number) => (
                    <div key={idx} className="text-xs text-gray-600 p-2 bg-purple-50 border border-purple-200 rounded">• {item}</div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modernization Plan */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Modernization Plan</h2>
          <div className="space-y-4 mb-6">
            {projectData.modernizationPlan.milestones.map((milestone: any, idx: number) => (
              <div key={idx} className="flex items-start space-x-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {milestone.status === 'completed' ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : milestone.status === 'in_progress' ? (
                    <Clock className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{milestone.name}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      milestone.confidence === 'High' ? 'bg-green-100 text-green-800' :
                      milestone.confidence === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {milestone.confidence} Confidence
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span>Owner: {milestone.owner}</span>
                    <span>ETA: {milestone.eta}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4">
            <h3 className="font-medium text-gray-900 mb-2">AI-Generated Plan</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
              <p className="text-sm text-gray-700 mb-3">{projectData.modernizationPlan.aiPlan.rationale}</p>
              <div className="space-y-1 mb-3">
                {projectData.modernizationPlan.aiPlan.steps.map((step: string, idx: number) => (
                  <div key={idx} className="text-sm text-gray-700">• {step}</div>
                ))}
              </div>
              <div className="pt-3 border-t border-blue-300">
                <p className="text-xs font-medium text-blue-900 mb-1">Rollback Plan:</p>
                <p className="text-xs text-blue-800">{projectData.modernizationPlan.aiPlan.rollbackPlan}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Idea→Production Funnel */}
        {/* <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Idea→Production Funnel</h2>
          <div className="space-y-4">
            {projectData.funnel.stages.map((stage: any, idx: number) => (
              <div key={idx} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">{stage.name}</h4>
                  <span className="text-xs text-gray-600">SLA: {stage.sla}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600 mb-1">WIP</div>
                    <div className="text-lg font-bold text-gray-900">{stage.wip}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Rework</div>
                    <div className="text-lg font-bold text-orange-600">{stage.rework}</div>
                  </div>
                  <div>
                    <div className="text-gray-600 mb-1">Stuck</div>
                    <div className="text-lg font-bold text-red-600">{stage.stuckReasons.length}</div>
                  </div>
                </div>
                {stage.stuckReasons.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-medium text-gray-700 mb-1">Stuck Reasons:</p>
                    <div className="space-y-1">
                      {stage.stuckReasons.map((reason: string, reasonIdx: number) => (
                        <div key={reasonIdx} className="text-xs text-gray-600 flex items-center">
                          <AlertCircle className="w-3 h-3 mr-1 text-red-500" />
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div> */}
      </div>
      )}
    </div>
  );
};

// Circle icon component
const Circle = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 20 20">
    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
  </svg>
);

export default ProjectDetail;

