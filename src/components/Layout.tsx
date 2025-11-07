import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Lightbulb, 
  Network, 
  Code, 
  Rocket, 
  TestTube, 
  Factory,
  Search,
  LogOut,
  User,
  BarChart3,
  Target,
  TrendingUp,
  Map
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // CTO-specific navigation
  const ctoNavigationItems = [
    { path: '/dashboard', label: 'Command Center', icon: LayoutDashboard, feature: 'dashboard' },
    { path: '/dashboard?view=portfolio', label: 'Portfolio', icon: BarChart3, feature: 'dashboard' },
    { path: '/dashboard?view=waves', label: 'Wave Planner', icon: Target, feature: 'dashboard' },
    { path: '/dashboard?view=opportunities', label: 'Opportunities', icon: TrendingUp, feature: 'dashboard' },
    { path: '/dashboard?view=heatmap', label: 'Heat Map', icon: Map, feature: 'dashboard' },
  ];

  // Regular navigation for other personas
  const regularNavigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, feature: 'dashboard' },
    { path: '/product-idea', label: 'Modernization', icon: Lightbulb, feature: 'product_idea' },
    { path: '/architecture-design', label: 'Architecture Design', icon: Network, feature: 'architecture_design' },
    { path: '/development', label: 'Development', icon: Code, feature: 'development' },
    { path: '/deployment', label: 'Deployment', icon: Rocket, feature: 'deployment' },
    { path: '/testing', label: 'Testing', icon: TestTube, feature: 'testing' },
    { path: '/production', label: 'Production', icon: Factory, feature: 'production' },
  ];

  // Choose navigation based on persona
  const navigationItems = user?.persona === 'CTO' ? ctoNavigationItems : regularNavigationItems;

  // Filter navigation items based on user permissions
  const filteredNavigationItems = navigationItems.filter(item => {
    if (item.path === '/dashboard' || item.path.startsWith('/dashboard?')) return true; // Dashboard is always accessible
    return useAuth().hasPermission(item.feature);
  });

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Navigation Pane */}
      <div className="w-64 bg-white shadow-lg">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-blue-600">Viztral.ai</h1>
          <p className="text-sm text-gray-600">AI-Powered Development</p>
        </div>
        
        <nav className="mt-6">
            {filteredNavigationItems.map((item) => {
            const Icon = item.icon;
            // For CTO navigation, check if path matches or if it's a dashboard query param
            let isActive = false;
            if (user?.persona === 'CTO' && item.path.includes('?')) {
              const queryParam = item.path.split('?')[1];
              isActive = location.search === `?${queryParam}` || 
                        (item.path === '/dashboard' && location.pathname === '/dashboard' && !location.search);
            } else {
              isActive = location.pathname === item.path;
            }
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Navigation Bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {filteredNavigationItems.find(item => item.path === location.pathname)?.label || 'Dashboard'}
              </h2>
              {user && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  {user.persona}
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* User Info */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-medium text-blue-600">
                  {user?.avatar || <User className="w-4 h-4" />}
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gray-700">{user?.name}</div>
                  <div className="text-xs text-gray-500">{user?.persona}</div>
                </div>
              </div>
              
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 