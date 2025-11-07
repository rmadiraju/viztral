import React, { useState } from 'react';
import { Factory, Rocket, CheckCircle, AlertCircle, Clock, Database, Server, Monitor, Code, Globe, Shield } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'ui';
  status: 'dev' | 'test' | 'prod';
  lastDeployed?: string;
  health: 'healthy' | 'warning' | 'critical';
}

interface Product {
  id: string;
  name: string;
  description: string;
  components: Component[];
  overallStatus: 'dev' | 'test' | 'prod';
  lastDeployed?: string;
  health: 'healthy' | 'warning' | 'critical';
}

const Production: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [deployingToProd, setDeployingToProd] = useState<Set<string>>(new Set());

  const products: Product[] = [
    {
      id: '1',
      name: 'E-commerce Platform',
      description: 'Full-stack e-commerce solution with microservices architecture',
      overallStatus: 'test',
      lastDeployed: '2024-01-15 14:55',
      health: 'healthy',
      components: [
        { id: '1', name: 'User Service', type: 'service', status: 'test', lastDeployed: '2024-01-15 14:30', health: 'healthy' },
        { id: '2', name: 'Product Service', type: 'service', status: 'test', lastDeployed: '2024-01-15 14:35', health: 'healthy' },
        { id: '3', name: 'Order Service', type: 'service', status: 'test', lastDeployed: '2024-01-15 14:40', health: 'healthy' },
        { id: '4', name: 'API Gateway', type: 'api', status: 'test', lastDeployed: '2024-01-15 14:45', health: 'healthy' },
        { id: '5', name: 'User Database', type: 'database', status: 'test', lastDeployed: '2024-01-15 14:50', health: 'healthy' },
        { id: '6', name: 'Web UI', type: 'ui', status: 'test', lastDeployed: '2024-01-15 14:55', health: 'healthy' }
      ]
    },
    {
      id: '2',
      name: 'Mobile Banking App',
      description: 'Secure banking application with real-time transaction processing',
      overallStatus: 'prod',
      lastDeployed: '2024-01-10 09:35',
      health: 'healthy',
      components: [
        { id: '7', name: 'Auth Service', type: 'service', status: 'prod', lastDeployed: '2024-01-10 09:15', health: 'healthy' },
        { id: '8', name: 'Transaction Service', type: 'service', status: 'prod', lastDeployed: '2024-01-10 09:20', health: 'healthy' },
        { id: '9', name: 'Notification Service', type: 'service', status: 'prod', lastDeployed: '2024-01-10 09:25', health: 'warning' },
        { id: '10', name: 'Mobile API', type: 'api', status: 'prod', lastDeployed: '2024-01-10 09:30', health: 'healthy' },
        { id: '11', name: 'Core Banking DB', type: 'database', status: 'prod', lastDeployed: '2024-01-10 09:35', health: 'healthy' }
      ]
    },
    {
      id: '3',
      name: 'AI Chatbot System',
      description: 'Intelligent chatbot platform with natural language processing',
      overallStatus: 'dev',
      lastDeployed: '2024-01-20 11:20',
      health: 'warning',
      components: [
        { id: '12', name: 'NLP Service', type: 'service', status: 'dev', lastDeployed: '2024-01-20 11:00', health: 'warning' },
        { id: '13', name: 'Chat Service', type: 'service', status: 'dev', lastDeployed: '2024-01-20 11:05', health: 'healthy' },
        { id: '14', name: 'Training Service', type: 'service', status: 'dev', lastDeployed: '2024-01-20 11:10', health: 'healthy' },
        { id: '15', name: 'Chat API', type: 'api', status: 'dev', lastDeployed: '2024-01-20 11:15', health: 'warning' },
        { id: '16', name: 'Knowledge Base', type: 'database', status: 'dev', lastDeployed: '2024-01-20 11:20', health: 'healthy' }
      ]
    }
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleDeployToProduction = async (product: Product) => {
    if (product.overallStatus === 'prod') return;

    setDeployingToProd(prev => new Set(prev).add(product.id));

    // Simulate deployment to production
    setTimeout(() => {
      // Update product status
      const updatedProduct = {
        ...product,
        overallStatus: 'prod' as const,
        lastDeployed: new Date().toLocaleString(),
        components: product.components.map(comp => ({
          ...comp,
          status: 'prod' as const,
          lastDeployed: new Date().toLocaleString()
        }))
      };

      // Update the products array
      const updatedProducts = products.map(p => p.id === product.id ? updatedProduct : p);
      
      // Update selected product if it's the one being deployed
      if (selectedProduct?.id === product.id) {
        setSelectedProduct(updatedProduct);
      }

      setDeployingToProd(prev => {
        const newSet = new Set(prev);
        newSet.delete(product.id);
        return newSet;
      });
    }, 5000 + Math.random() * 3000); // 5-8 seconds
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
      case 'prod': return 'bg-green-100 text-green-800';
      case 'test': return 'bg-yellow-100 text-yellow-800';
      case 'dev': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <AlertCircle className="w-4 h-4" />;
      case 'critical': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Side - Products List */}
      <div className="w-1/3 flex flex-col border-r border-gray-200">
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Production Status</h2>
          <p className="text-sm text-gray-600">Monitor and deploy products to production</p>
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
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${getHealthColor(product.health)}`}></div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(product.overallStatus)}`}>
                    {product.overallStatus === 'prod' ? <Globe className="w-3 h-3 inline mr-1" /> : <Rocket className="w-3 h-3 inline mr-1" />}
                    {product.overallStatus}
                  </span>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">{product.description}</p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">
                  {product.components.length} components
                </span>
                {product.lastDeployed && (
                  <span className="text-gray-500">
                    Deployed: {product.lastDeployed}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Product Details and Production Controls */}
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
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getHealthColor(selectedProduct.health)}`}></div>
                    <span className="text-sm text-gray-600">
                      {selectedProduct.health === 'healthy' ? 'Healthy' : 
                       selectedProduct.health === 'warning' ? 'Warning' : 'Critical'}
                    </span>
                  </div>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedProduct.overallStatus)}`}>
                    {selectedProduct.overallStatus === 'prod' ? (
                      <>
                        <Globe className="w-4 h-4 inline mr-2" />
                        In Production
                      </>
                    ) : (
                      <>
                        <Rocket className="w-4 h-4 inline mr-2" />
                        {selectedProduct.overallStatus === 'test' ? 'Ready for Production' : 'In Development'}
                      </>
                    )}
                  </span>
                  
                  {selectedProduct.overallStatus !== 'prod' && (
                    <button
                      onClick={() => handleDeployToProduction(selectedProduct)}
                      disabled={deployingToProd.has(selectedProduct.id)}
                      className={`px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors flex items-center ${
                        deployingToProd.has(selectedProduct.id)
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700'
                      }`}
                    >
                      {deployingToProd.has(selectedProduct.id) ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Deploying to Production...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Deploy to Production
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              {selectedProduct.lastDeployed && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Last Deployed:</strong> {selectedProduct.lastDeployed}
                  </p>
                </div>
              )}
            </div>

            {/* Components Table */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Component Status</h3>
                
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
                          Environment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Health
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Deployed
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
                              {component.status === 'prod' && <Globe className="w-3 h-3 mr-1" />}
                              {component.status === 'test' && <Rocket className="w-3 h-3 mr-1" />}
                              {component.status === 'dev' && <Code className="w-3 h-3 mr-1" />}
                              {component.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              component.health === 'healthy' ? 'bg-green-100 text-green-800' :
                              component.health === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {getHealthIcon(component.health)}
                              <span className="ml-1">{component.health}</span>
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {component.lastDeployed || 'Not deployed'}
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
              <Factory className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Product</h3>
              <p className="text-gray-600">Choose a product from the left panel to view production status and deployment options.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Production; 