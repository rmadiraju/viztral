import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Target,
  Zap,
  AlertCircle,
  DollarSign,
  Cloud,
  TrendingUp,
  Calendar,
  Building,
  Layers,
  Filter,
  BarChart3,
  AlertTriangle,
  Sparkles,
  Coins
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

type ViewMode = 'portfolio' | 'waves' | 'opportunities' | 'heatmap';

const CTODashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedOrg, setSelectedOrg] = useState('All Organizations');
  const [timeRange, setTimeRange] = useState('Last 30 days');
  const [environment, setEnvironment] = useState('All Environments');
  const viewFromUrl = searchParams.get('view');
  const initialViewMode: ViewMode = (viewFromUrl === 'portfolio' || viewFromUrl === 'waves' || viewFromUrl === 'opportunities' || viewFromUrl === 'heatmap') 
    ? viewFromUrl as ViewMode 
    : 'portfolio';
  
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const [selectedFilter, setSelectedFilter] = useState('All Projects');

  // Sync view mode from URL params when URL changes (e.g., navigation clicks)
  useEffect(() => {
    const view = searchParams.get('view');
    const newViewMode: ViewMode = (view === 'portfolio' || view === 'waves' || view === 'opportunities' || view === 'heatmap') 
      ? view as ViewMode 
      : 'portfolio';
    
    if (newViewMode !== viewMode) {
      setViewMode(newViewMode);
    }
  }, [searchParams]);

  // Update URL when view mode changes (e.g., dropdown selection)
  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    if (newMode !== 'portfolio') {
      setSearchParams({ view: newMode }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  // Dummy data for KPIs
  const kpiData = {
    modernizationCoverage: {
      percentage: 68,
      total: 50,
      approved: 34,
      trend: '+5%'
    },
    leadTime: {
      p50: 42,
      p90: 78,
      ideaToDesign: 14,
      designToBuild: 18,
      buildToLaunch: 10
    },
    techDebt: {
      amount: 2400000,
      highRiskCount: 8,
      trend: '+$120K'
    },
    cloudWaste: {
      monthly: 48000,
      ytdSavings: 320000,
      trend: '-12%'
    }
  };

  // Dummy portfolio data
  const portfolioData = [
    {
      project: 'Mainframe Payment System',
      owner: 'Sarah Johnson',
      priority: 9.2,
      readiness: 45,
      legacyCriticality: 95,
      businessImpact: 98,
      riskDollars: 450000,
      wasteDollars: 12000,
      sixR: 'Refactor',
      wave: 1,
      eta: '2024-06-15',
      lastProgress: '2 days ago',
      riskLevel: 'high' as const
    },
    {
      project: 'Legacy ETL Pipeline',
      owner: 'Michael Chen',
      priority: 8.8,
      readiness: 65,
      legacyCriticality: 85,
      businessImpact: 75,
      riskDollars: 280000,
      wasteDollars: 8500,
      sixR: 'Replatform',
      wave: 2,
      eta: '2024-08-20',
      lastProgress: '5 days ago',
      riskLevel: 'high' as const
    },
    {
      project: 'Monolith Order Service',
      owner: 'Alex Rodriguez',
      priority: 8.5,
      readiness: 72,
      legacyCriticality: 70,
      businessImpact: 80,
      riskDollars: 320000,
      wasteDollars: 15000,
      sixR: 'Refactor',
      wave: 1,
      eta: '2024-07-01',
      lastProgress: '1 day ago',
      riskLevel: 'medium' as const
    },
    {
      project: 'COBOL Financial Core',
      owner: 'Emily Watson',
      priority: 9.5,
      readiness: 25,
      legacyCriticality: 98,
      businessImpact: 99,
      riskDollars: 650000,
      wasteDollars: 22000,
      sixR: 'Rewrite',
      wave: 1,
      eta: '2024-09-30',
      lastProgress: '7 days ago',
      riskLevel: 'critical' as const
    },
    {
      project: 'VB.NET Admin Portal',
      owner: 'David Kim',
      priority: 7.2,
      readiness: 90,
      legacyCriticality: 60,
      businessImpact: 55,
      riskDollars: 0,
      wasteDollars: 3000,
      sixR: 'Completed',
      wave: 0,
      eta: '2024-03-01',
      lastProgress: 'Completed',
      riskLevel: 'low' as const
    },
    {
      project: 'Legacy Database Cluster',
      owner: 'Lisa Anderson',
      priority: 8.0,
      readiness: 58,
      legacyCriticality: 75,
      businessImpact: 70,
      riskDollars: 390000,
      wasteDollars: 18000,
      sixR: 'Rehost',
      wave: 2,
      eta: '2024-08-15',
      lastProgress: '3 days ago',
      riskLevel: 'medium' as const
    },
  ];

  // Dummy opportunity data
  const opportunityData = [
    {
      id: 1,
      type: 'cost' as const,
      title: 'Rightsize EC2 Instances',
      potential: 24000,
      effort: 'M',
      owner: 'Infrastructure Team',
      category: 'Rightsizing',
      description: 'Downsize over-provisioned instances in dev/staging'
    },
    {
      id: 2,
      type: 'cost' as const,
      title: 'Reserved Instance Optimization',
      potential: 18000,
      effort: 'S',
      owner: 'Finance Team',
      category: 'RI/SP Savings',
      description: 'Convert on-demand to RIs for predictable workloads'
    },
    {
      id: 3,
      type: 'risk' as const,
      title: 'EOL Java 8 Runtime',
      potential: 350000,
      effort: 'L',
      owner: 'Platform Team',
      category: 'EOL Runtimes',
      description: '15 services running on Java 8 (EOL since 2019)'
    },
    {
      id: 4,
      type: 'risk' as const,
      title: 'Critical CVEs - Payment Gateway',
      potential: 500000,
      effort: 'M',
      owner: 'Security Team',
      category: 'Unpatched CVEs',
      description: '3 critical vulnerabilities requiring immediate attention'
    },
    {
      id: 5,
      type: 'cost' as const,
      title: 'Storage Lifecycle Policy',
      potential: 8500,
      effort: 'S',
      owner: 'Storage Team',
      category: 'Storage Lifecycle',
      description: 'Move cold data to cheaper storage tiers'
    },
    {
      id: 6,
      type: 'risk' as const,
      title: 'Secret Sprawl - 45 Hardcoded Secrets',
      potential: 200000,
      effort: 'M',
      owner: 'Security Team',
      category: 'Secret Sprawl',
      description: 'Secrets found in code repositories'
    },
  ];

  // Dummy wave data
  const waveData = [
    {
      wave: 1,
      projects: ['Mainframe Payment System', 'COBOL Financial Core', 'Monolith Order Service'],
      startDate: '2024-04-01',
      endDate: '2024-09-30',
      dependencies: ['Payments before Ledger'],
      roi: 2.4,
      risk: 'High'
    },
    {
      wave: 2,
      projects: ['Legacy ETL Pipeline', 'Legacy Database Cluster'],
      startDate: '2024-07-01',
      endDate: '2024-12-31',
      dependencies: ['Wave 1 completion'],
      roi: 1.8,
      risk: 'Medium'
    },
    {
      wave: 3,
      projects: ['Legacy API Gateway', 'Old Authentication Service'],
      startDate: '2024-10-01',
      endDate: '2025-03-31',
      dependencies: ['Wave 2 completion'],
      roi: 1.5,
      risk: 'Low'
    },
  ];

  // Dummy AI recommendations
  const aiRecommendations = [
    {
      title: 'Migrate Core-Payments to Managed Postgres',
      rationale: 'Current self-managed DB requires 24/7 ops, high MTTR',
      evidence: 'Estimated $14k/mo savings, MTTR ↓30%, 3 incidents/month prevented',
      impact: 'high' as const
    },
    {
      title: 'Containerize Legacy Batch Jobs',
      rationale: 'Current VM-based approach prevents auto-scaling',
      evidence: 'Could reduce compute costs by 40%, enable Kubernetes migration',
      impact: 'medium' as const
    },
    {
      title: 'Implement API Gateway for Microservices',
      rationale: 'Direct service-to-service calls creating tight coupling',
      evidence: 'Would enable gradual migration, reduce blast radius by 60%',
      impact: 'high' as const
    },
  ];

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'bg-red-50 border-red-200';
      case 'high': return 'bg-orange-50 border-orange-200';
      case 'medium': return 'bg-yellow-50 border-yellow-200';
      case 'low': return 'bg-green-50 border-green-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getWaveBadge = (wave: number) => {
    if (wave === 0) return null;
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-indigo-500'];
    return (
      <span className={`w-3 h-3 rounded-full ${colors[wave - 1]} inline-block mr-1`} />
    );
  };

  const renderPortfolioView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Project</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Owner</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Priority</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Readiness</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Legacy Crit.</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Business Impact</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Risk $</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Waste $</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">6R Decision</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Wave</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">ETA</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">Last Progress</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {portfolioData.map((project, index) => (
              <tr
                key={index}
                onClick={() => navigate(`/project/${encodeURIComponent(project.project)}`)}
                className={`hover:bg-gray-50 cursor-pointer border-l-4 transition-colors ${
                  project.riskLevel === 'critical' ? 'border-red-500' :
                  project.riskLevel === 'high' ? 'border-orange-500' :
                  project.riskLevel === 'medium' ? 'border-yellow-500' :
                  'border-green-500'
                }`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    {getWaveBadge(project.wave)}
                    <span className="text-sm font-medium text-gray-900">{project.project}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{project.owner}</td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    project.priority >= 9 ? 'bg-red-100 text-red-800' :
                    project.priority >= 8.5 ? 'bg-orange-100 text-orange-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {project.priority.toFixed(1)}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${project.readiness}%` }}></div>
                    </div>
                    <span className="text-sm text-gray-600">{project.readiness}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{project.legacyCriticality}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{project.businessImpact}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-red-600">
                  ${(project.riskDollars / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-orange-600">
                  ${(project.wasteDollars / 1000).toFixed(0)}K
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    project.sixR === 'Completed' ? 'bg-green-100 text-green-800' :
                    project.sixR === 'Rewrite' ? 'bg-purple-100 text-purple-800' :
                    project.sixR === 'Refactor' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {project.sixR}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                  {project.wave > 0 ? `Wave ${project.wave}` : '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{project.eta}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{project.lastProgress}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderWavePlannerView = () => (
    <div className="space-y-6">
      {waveData.map((wave) => (
        <div key={wave.wave} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span className={`w-4 h-4 rounded-full ${
                wave.wave === 1 ? 'bg-blue-500' :
                wave.wave === 2 ? 'bg-purple-500' :
                'bg-indigo-500'
              }`} />
              <h3 className="text-lg font-semibold text-gray-900">Wave {wave.wave}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                wave.risk === 'High' ? 'bg-red-100 text-red-800' :
                wave.risk === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {wave.risk} Risk
              </span>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                ROI: {wave.roi}x
              </span>
            </div>
            <div className="text-sm text-gray-600">
              {wave.startDate} → {wave.endDate}
            </div>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Timeline</span>
              <span className="text-xs text-gray-500">~{Math.round((new Date(wave.endDate).getTime() - new Date(wave.startDate).getTime()) / (1000 * 60 * 60 * 24))} days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 relative">
              <div
                className={`h-3 rounded-full ${
                  wave.wave === 1 ? 'bg-blue-500' :
                  wave.wave === 2 ? 'bg-purple-500' :
                  'bg-indigo-500'
                }`}
                style={{ width: wave.wave === 1 ? '40%' : wave.wave === 2 ? '10%' : '0%' }}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700">Projects:</div>
            <div className="flex flex-wrap gap-2">
              {wave.projects.map((project, idx) => (
                <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                  {project}
                </span>
              ))}
            </div>
            {wave.dependencies.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">Dependencies:</span> {wave.dependencies.join(', ')}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  const renderOpportunityBoardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {opportunityData.map((opp) => (
        <div
          key={opp.id}
          className={`rounded-lg border-2 p-4 ${
            opp.type === 'cost' ? 'border-blue-200 bg-blue-50' : 'border-red-200 bg-red-50'
          }`}
        >
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                {opp.type === 'cost' ? (
                  <Coins className="w-4 h-4 text-blue-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-medium px-2 py-1 rounded ${
                  opp.type === 'cost' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                }`}>
                  {opp.type === 'cost' ? 'COST' : 'RISK'}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 mb-1">{opp.title}</h4>
              <p className="text-xs text-gray-600 mb-2">{opp.description}</p>
            </div>
          </div>
          
          <div className="space-y-2 mb-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Potential:</span>
              <span className={`font-bold ${
                opp.type === 'cost' ? 'text-blue-600' : 'text-red-600'
              }`}>
                ${(opp.potential / 1000).toFixed(0)}K{opp.type === 'cost' ? '/mo' : ''}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Effort:</span>
              <span className={`font-medium ${
                opp.effort === 'S' ? 'text-green-600' :
                opp.effort === 'M' ? 'text-yellow-600' :
                'text-red-600'
              }`}>
                {opp.effort === 'S' ? 'Small' : opp.effort === 'M' ? 'Medium' : 'Large'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Owner:</span>
              <span className="font-medium text-gray-700">{opp.owner}</span>
            </div>
            <div className="text-xs text-gray-500">{opp.category}</div>
          </div>

          <button className="w-full mt-2 px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors">
            Create Task
          </button>
        </div>
      ))}
    </div>
  );

  const renderHeatMapView = () => {
    const domains = ['Payments', 'Ordering', 'Inventory', 'Customer', 'Analytics', 'Platform'];
    const pillars = ['Architecture', 'Delivery', 'Reliability', 'Security', 'Cost', 'Governance'];
    
    const heatMapData: { [key: string]: number } = {
      'Payments-Architecture': 85,
      'Payments-Delivery': 65,
      'Payments-Reliability': 90,
      'Payments-Security': 75,
      'Payments-Cost': 80,
      'Payments-Governance': 70,
      'Ordering-Architecture': 60,
      'Ordering-Delivery': 75,
      'Ordering-Reliability': 70,
      'Ordering-Security': 65,
      'Ordering-Cost': 70,
      'Ordering-Governance': 68,
      'Inventory-Architecture': 55,
      'Inventory-Delivery': 60,
      'Inventory-Reliability': 65,
      'Inventory-Security': 60,
      'Inventory-Cost': 75,
      'Inventory-Governance': 65,
      'Customer-Architecture': 70,
      'Customer-Delivery': 80,
      'Customer-Reliability': 75,
      'Customer-Security': 70,
      'Customer-Cost': 65,
      'Customer-Governance': 72,
      'Analytics-Architecture': 50,
      'Analytics-Delivery': 55,
      'Analytics-Reliability': 60,
      'Analytics-Security': 58,
      'Analytics-Cost': 70,
      'Analytics-Governance': 62,
      'Platform-Architecture': 75,
      'Platform-Delivery': 70,
      'Platform-Reliability': 85,
      'Platform-Security': 80,
      'Platform-Cost': 68,
      'Platform-Governance': 78,
    };

    const getHeatColor = (value: number) => {
      if (value >= 80) return 'bg-red-500';
      if (value >= 70) return 'bg-orange-400';
      if (value >= 60) return 'bg-yellow-400';
      return 'bg-green-400';
    };

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Domain vs Pillar Heat Map</h3>
          <p className="text-sm text-gray-600">Click any cell to filter portfolio view</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-700"></th>
                {pillars.map((pillar) => (
                  <th key={pillar} className="px-3 py-2 text-center text-xs font-medium text-gray-700 min-w-[100px]">
                    {pillar}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {domains.map((domain) => (
                <tr key={domain}>
                  <td className="px-3 py-2 text-sm font-medium text-gray-700">{domain}</td>
                  {pillars.map((pillar) => {
                    const key = `${domain}-${pillar}`;
                    const value = heatMapData[key] || 0;
                    return (
                      <td key={pillar} className="px-3 py-2">
                        <div
                          className={`${getHeatColor(value)} text-white text-xs font-medium rounded p-2 text-center cursor-pointer hover:opacity-80 transition-opacity`}
                          title={`${domain} - ${pillar}: ${value}`}
                        >
                          {value}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex items-center space-x-4 text-xs text-gray-600">
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span>80-100 (High)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-orange-400 rounded"></div>
            <span>70-79 (Medium-High)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-yellow-400 rounded"></div>
            <span>60-69 (Medium)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-4 bg-green-400 rounded"></div>
            <span>0-59 (Low)</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Modernization Command Center</h1>
        <p className="text-indigo-100">
          Where to act, why it matters, and the ROI
        </p>
      </div>

      {/* Global Controls */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Building className="w-3 h-3 inline mr-1" />
              Org/Business Unit
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>All Organizations</option>
              <option>Engineering</option>
              <option>Platform</option>
              <option>Product</option>
              <option>Infrastructure</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Calendar className="w-3 h-3 inline mr-1" />
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
              <option>Last 6 months</option>
              <option>Last year</option>
              <option>All time</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Layers className="w-3 h-3 inline mr-1" />
              Environment
            </label>
            <select
              value={environment}
              onChange={(e) => setEnvironment(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>All Environments</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <BarChart3 className="w-3 h-3 inline mr-1" />
              View
            </label>
            <select
              value={viewMode}
              onChange={(e) => handleViewModeChange(e.target.value as ViewMode)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="portfolio">Portfolio</option>
              <option value="waves">Waves</option>
              <option value="opportunities">Opportunities</option>
              <option value="heatmap">Heat Map</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              <Filter className="w-3 h-3 inline mr-1" />
              Saved Filters
            </label>
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option>All Projects</option>
              <option>Mainframe</option>
              <option>EOL in 6m</option>
              <option>High Priority</option>
              <option>Legacy Systems</option>
            </select>
          </div>
        </div>
      </div>

      {/* Top KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs text-gray-500">Modernization Coverage</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{kpiData.modernizationCoverage.percentage}%</h3>
          <p className="text-xs text-gray-600 mb-2">
            {kpiData.modernizationCoverage.approved} / {kpiData.modernizationCoverage.total} legacy projects
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${kpiData.modernizationCoverage.percentage}%` }}></div>
          </div>
          <div className="mt-2 text-xs text-green-600">
            <TrendingUp className="w-3 h-3 inline mr-1" />
            {kpiData.modernizationCoverage.trend}
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <Zap className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs text-gray-500">Idea→Prod Lead Time</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">{kpiData.leadTime.p50}d</h3>
          <p className="text-xs text-gray-600 mb-2">
            p50: {kpiData.leadTime.p50}d / p90: {kpiData.leadTime.p90}d
          </p>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Idea→Design:</span>
              <span className="font-medium">{kpiData.leadTime.ideaToDesign}d</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Design→Build:</span>
              <span className="font-medium">{kpiData.leadTime.designToBuild}d</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Build→Launch:</span>
              <span className="font-medium">{kpiData.leadTime.buildToLaunch}d</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-xs text-gray-500">Risk-Weighted Tech Debt</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">${(kpiData.techDebt.amount / 1000000).toFixed(1)}M</h3>
          <p className="text-xs text-gray-600 mb-2">
            Risk-weighted estimate
          </p>
          <div className="mt-2 text-xs text-red-600">
            <AlertTriangle className="w-3 h-3 inline mr-1" />
            High risk: {kpiData.techDebt.highRiskCount} projects
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Cloud className="w-5 h-5 text-orange-600" />
            </div>
            <span className="text-xs text-gray-500">Cloud Waste</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">${(kpiData.cloudWaste.monthly / 1000).toFixed(0)}K</h3>
          <p className="text-xs text-gray-600 mb-2">
            Waste / month
          </p>
          <div className="mt-2 text-xs text-green-600">
            <DollarSign className="w-3 h-3 inline mr-1" />
            Saved: ${(kpiData.cloudWaste.ytdSavings / 1000).toFixed(0)}K YTD
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Column - Main View */}
        <div className="lg:col-span-3">
          {viewMode === 'portfolio' && renderPortfolioView()}
          {viewMode === 'waves' && renderWavePlannerView()}
          {viewMode === 'opportunities' && renderOpportunityBoardView()}
          {viewMode === 'heatmap' && renderHeatMapView()}
        </div>

        {/* Right Rail - AI Recommendations */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 sticky top-6">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
            </div>
            <div className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900 text-sm">{rec.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rec.impact === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {rec.impact}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{rec.rationale}</p>
                  <p className="text-xs text-blue-600 font-medium">{rec.evidence}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CTODashboard;

