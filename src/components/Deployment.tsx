import React, { useState } from 'react';
import { Rocket, Play, CheckCircle, Clock, AlertCircle, Database, Server, Monitor, Code } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'ui';
  status: 'pending' | 'deployed' | 'failed';
  lastDeployed?: string;
  environment: 'dev' | 'test' | 'prod';
}

interface Product {
  id: string;
  name: string;
  description: string;
  components: Component[];
  overallStatus: 'ready' | 'deploying' | 'deployed' | 'failed';
}

const Deployment: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deployingComponents, setDeployingComponents] = useState<Set<string>>(new Set());

  const products: Product[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with microservices architecture',
      overallStatus: 'ready',
      components: [
        { id: '1', name: 'User Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-15 14:30', environment: 'test' },
        { id: '2', name: 'Product Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-15 14:35', environment: 'test' },
        { id: '3', name: 'Order Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-15 14:40', environment: 'test' },
        { id: '4', name: 'API Gateway', type: 'api', status: 'deployed', lastDeployed: '2024-01-15 14:45', environment: 'test' },
        { id: '5', name: 'User Database', type: 'database', status: 'deployed', lastDeployed: '2024-01-15 14:50', environment: 'test' },
        { id: '6', name: 'Web UI', type: 'ui', status: 'deployed', lastDeployed: '2024-01-15 14:55', environment: 'test' }
      ]
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      description: 'Secure banking application with real-time transaction processing',
      overallStatus: 'deployed',
      components: [
        { id: '7', name: 'Auth Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-10 09:15', environment: 'test' },
        { id: '8', name: 'Transaction Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-10 09:20', environment: 'test' },
        { id: '9', name: 'Notification Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-10 09:25', environment: 'test' },
        { id: '10', name: 'Mobile API', type: 'api', status: 'deployed', lastDeployed: '2024-01-10 09:30', environment: 'test' },
        { id: '11', name: 'Core Banking DB', type: 'database', status: 'deployed', lastDeployed: '2024-01-10 09:35', environment: 'test' }
      ]
    },
    {
      id: '3',
      name: 'AI Chatbot System',
      description: 'Intelligent chatbot platform with natural language processing',
      overallStatus: 'ready',
      components: [
        { id: '12', name: 'NLP Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-20 11:00', environment: 'test' },
        { id: '13', name: 'Chat Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-20 11:05', environment: 'test' },
        { id: '14', name: 'Training Service', type: 'service', status: 'deployed', lastDeployed: '2024-01-20 11:10', environment: 'test' },
        { id: '15', name: 'Chat API', type: 'api', status: 'deployed', lastDeployed: '2024-01-20 11:15', environment: 'test' },
        { id: '16', name: 'Knowledge Base', type: 'database', status: 'deployed', lastDeployed: '2024-01-20 11:20', environment: 'test' }
      ]
    }
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeployToTest = async (component: Component) => {
    if (component.status === 'deployed') return;

    setDeployingComponents(prev => new Set(prev).add(component.id));

    // Simulate deployment process
    setTimeout(() => {
      // Update component status
      if (selectedProduct) {
        const updatedProduct = {
          ...selectedProduct,
          components: selectedProduct.components.map(comp =>
            comp.id === component.id
              ? { ...comp, status: 'deployed' as const, lastDeployed: new Date().toLocaleString(), environment: 'test' as const }
              : comp
          )
        };
        setSelectedProduct(updatedProduct);
      }

      setDeployingComponents(prev => {
        const newSet = new Set(prev);
        newSet.delete(component.id);
        return newSet;
      });
    }, 3000 + Math.random() * 2000); // 3-5 seconds
  };

  const getComponentIcon = (type: string) => {
    switch (type) {
      case 'service': return <Server className="w-5 h-5" />;
      case 'database': return <Database className="w-5 h-5" />;
      case 'api': return <Monitor className="w-5 h-5" />;
      case 'ui': return <Code className="w-5 h-5" />;
      default: return <Code className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-100 text-green-800';
      case 'deploying': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOverallStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return 'bg-green-500';
      case 'deploying': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Side - Products List */}
      <div className="w-1/3 flex flex-col border-r border-gray-200">
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Products Ready for Deployment</h2>
          <p className="text-sm text-gray-600">Select a product to view components and deploy to test</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {products.map((product) => (
            <div
              key={product.id}
              onClick={() => handleProductSelect(product)}
              className={`p-6 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
                selectedProduct?.id === product.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{product.name}</h3>
                <div className={`w-3 h-3 rounded-full ${getOverallStatusColor(product.overallStatus)}`}></div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {product.components.length} components
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.overallStatus)}`}>
                  {product.overallStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Component Details and Deployment */}
      <div className="w-2/3 flex flex-col">
        {selectedProduct ? (
          <>
            {/* Product Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">{selectedProduct.name}</h2>
                  <p className="text-sm text-gray-600">{selectedProduct.description}</p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProduct.overallStatus)}`}>
                    {selectedProduct.overallStatus}
                  </span>
                  <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                    <Rocket className="w-4 h-4 mr-2" />
                    Deploy All to Test
                  </button>
                </div>
              </div>
            </div>

            {/* Components Table */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Components</h3>
                
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Component
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Deployed
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedProduct.components.map((component) => (
                        <tr key={component.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                                {getComponentIcon(component.type)}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{component.name}</div>
                                <div className="text-sm text-gray-500">{component.type}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {component.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                                                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(component.status)}`}>
                           {component.status === 'deployed' && <CheckCircle className="w-3 h-3 mr-1" />}
                           {component.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                           {component.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                           {component.status}
                         </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {component.lastDeployed || 'Not deployed'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            {component.status === 'deployed' ? (
                              <span className="text-green-600">✓ Deployed to Test</span>
                            ) : (
                              <button
                                onClick={() => handleDeployToTest(component)}
                                disabled={deployingComponents.has(component.id)}
                                className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                  deployingComponents.has(component.id)
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                }`}
                              >
                                {deployingComponents.has(component.id) ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                                    Deploying...
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3 mr-1" />
                                    Deploy to Test
                                  </>
                                )}
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Rocket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
              <p className="text-gray-600">Choose a product from the left panel to view components and deployment options.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Deployment; 