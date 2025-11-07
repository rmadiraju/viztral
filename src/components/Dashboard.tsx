import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FolderOpen, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  TrendingUp,
  Users,
  Code,
  Rocket,
  Lightbulb,
  TestTube,
  Network
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import CTODashboard from './CTODashboard';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  
  // If CTO persona, show CTO Dashboard
  if (user?.persona === 'CTO') {
    return <CTODashboard />;
  }
  
  const stats = [
    { title: 'Total Projects', value: '12', icon: FolderOpen, color: 'bg-blue-500', change: '+2 this month' },
    { title: 'In Progress', value: '5', icon: Clock, color: 'bg-yellow-500', change: '3 due this week' },
    { title: 'Completed', value: '6', icon: CheckCircle, color: 'bg-green-500', change: '+1 this week' },
    { title: 'On Hold', value: '1', icon: AlertCircle, color: 'bg-red-500', change: '1 pending review' },
  ];

  const recentProjects = [
    { name: 'E-commerce Platform', status: 'In Progress', progress: 65, team: 8, dueDate: '2024-02-15' },
    { name: 'Mobile Banking App', status: 'Completed', progress: 100, team: 12, dueDate: '2024-01-30' },
    { name: 'AI Chatbot System', status: 'In Progress', progress: 35, team: 6, dueDate: '2024-03-01' },
    { name: 'Data Analytics Dashboard', status: 'On Hold', progress: 20, team: 4, dueDate: '2024-02-28' },
  ];



  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name || 'User'}!</h1>
        <p className="text-blue-100">
          {user?.role === 'product_owner' && "Here's your product portfolio and testing status."}
          {user?.role === 'architect' && "Here's your architecture design projects and system overview."}
          {user?.role === 'developer' && "Here's your development tasks and deployment status."}
          {user?.role === 'qa' && "Here's your testing assignments and quality metrics."}
          {!user?.role && "Here's what's happening with your projects today."}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Projects */}
        <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentProjects.map((project, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{project.name}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {project.status}
                    </span>
                    <span>Team: {project.team}</span>
                    <span>Due: {project.dueDate}</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-900">{project.progress}%</div>
                  <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                    <div 
                      className={`h-2 rounded-full ${
                        project.progress === 100 ? 'bg-green-500' :
                        project.progress > 50 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            {user?.role === 'product_owner' && (
              <>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Lightbulb className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">New Product Idea</div>
                      <div className="text-sm text-gray-500">Start brainstorming a new product</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <TestTube className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Review Test Results</div>
                      <div className="text-sm text-gray-500">Check testing progress</div>
                    </div>
                  </div>
                </button>
              </>
            )}
            
            {user?.role === 'architect' && (
              <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 p-2 rounded-lg">
                    <Network className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Design Architecture</div>
                    <div className="text-sm text-gray-500">Create new system architecture</div>
                  </div>
                </div>
              </button>
            )}
            
            {user?.role === 'developer' && (
              <>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Code className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Generate Code</div>
                      <div className="text-sm text-gray-500">Start code generation</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-orange-500 p-2 rounded-lg">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Deploy to Test</div>
                      <div className="text-sm text-gray-500">Deploy latest changes</div>
                    </div>
                  </div>
                </button>
              </>
            )}
            
            {user?.role === 'qa' && (
              <>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <TestTube className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Run Tests</div>
                      <div className="text-sm text-gray-500">Execute test suites</div>
                    </div>
                  </div>
                </button>
                <button className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="bg-green-500 p-2 rounded-lg">
                      <Rocket className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Deploy to Test</div>
                      <div className="text-sm text-gray-500">Deploy for testing</div>
                    </div>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        
        <div className="space-y-4">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">E-commerce Platform</span> requirements submitted
              </p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">Mobile Banking App</span> deployed to production
              </p>
              <p className="text-xs text-gray-500">1 day ago</p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">
                <span className="font-medium">AI Chatbot System</span> architecture approved
              </p>
              <p className="text-xs text-gray-500">3 days ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 