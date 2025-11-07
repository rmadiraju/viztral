import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Play, CheckCircle, XCircle, Clock, RefreshCw, FolderOpen, Code, RotateCcw, Server, Database, Shield, Zap, Users, ShoppingCart, Bell, BarChart3 } from 'lucide-react';
import { apiService } from '../services/api';

interface ServiceStatus {
  name: string;
  status: 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
  lastUpdated: string;
  technology?: string;
  description?: string;
  message?: string;
}

interface ServiceDetails {
  name: string;
  description: string;
  technology: string;
  framework?: string;
  database?: string;
  deployment?: string;
  files?: string[];
}

const Development: React.FC = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [serviceDetails, setServiceDetails] = useState<ServiceDetails[]>([]);

  // Mock service details - in real implementation, this would come from architecture diagram
  const mockServiceDetails: ServiceDetails[] = [
    { 
      name: 'UserService', 
      description: 'Handles user authentication and management', 
      technology: 'Java',
      framework: 'Spring Boot',
      database: 'PostgreSQL',
      deployment: 'Docker',
      files: ['UserController.java', 'UserService.java', 'UserRepository.java', 'User.java']
    },
    { 
      name: 'PaymentService', 
      description: 'Processes payment transactions', 
      technology: 'JavaScript',
      framework: 'Node.js',
      database: 'MongoDB',
      deployment: 'Kubernetes',
      files: ['paymentController.js', 'paymentService.js', 'paymentModel.js', 'routes.js']
    },
    { 
      name: 'OrderService', 
      description: 'Manages order processing workflow', 
      technology: 'Python',
      framework: 'FastAPI',
      database: 'Redis',
      deployment: 'Docker',
      files: ['order_controller.py', 'order_service.py', 'order_model.py', 'main.py']
    },
    { 
      name: 'NotificationService', 
      description: 'Sends notifications and alerts', 
      technology: 'Go',
      framework: 'Gin',
      database: 'PostgreSQL',
      deployment: 'Docker',
      files: ['notification.go', 'email.go', 'sms.go', 'main.go']
    },
  ];

  useEffect(() => {
    setServiceDetails(mockServiceDetails);
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Get all services from the architecture diagram
      const architectureDiagram = await apiService.getArchitectureDiagram('writ3it', 'cobol-examples');
      
      // Map architecture nodes to services
      const architectureServices = architectureDiagram.nodes.map(node => ({
        name: node.data.label,
        status: 'Not Started' as const, // Default status for new services
        lastUpdated: new Date().toISOString(),
        technology: node.data.technology || 'Unknown',
        description: node.data.description || ''
      }));

      // Get current status for each service individually
      const servicesWithStatus = await Promise.all(
        architectureServices.map(async (service) => {
          try {
            const statusResponse = await apiService.getServiceStatusWithMessage(service.name);
            return {
              ...service,
              status: statusResponse.status as 'Not Started' | 'In Progress' | 'Completed' | 'Failed',
              message: statusResponse.message,
              lastUpdated: new Date().toISOString()
            };
          } catch (error) {
            console.log(`No status found for ${service.name}, using default`);
            return {
              ...service,
              status: 'Not Started' as const,
              message: 'Status not available'
            };
          }
        })
      );
      
      setServices(servicesWithStatus);

      // Update service details
      if (architectureServices.length > 0) {
        setServiceDetails(architectureServices.map(service => ({
          name: service.name,
          description: service.description,
          technology: service.technology,
          files: [] // Will be populated when code is generated
        })));
      } else {
        // Fallback to mock data if no architecture services found
        setServiceDetails(mockServiceDetails);
      }
    } catch (error) {
      console.error('Failed to load architecture services:', error);
      // Fallback to mock data - ensure all services are shown
      const fallbackServices = mockServiceDetails.map(service => ({
        name: service.name,
        status: 'Not Started' as const,
        lastUpdated: new Date().toISOString(),
        technology: service.technology,
        description: service.description
      }));
      setServices(fallbackServices);
      setServiceDetails(mockServiceDetails);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'Failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'In Progress':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return <FolderOpen className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: ServiceStatus['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'Failed':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'In Progress':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-600';
    }
  };

  const getServiceIcon = (serviceName: string) => {
    const name = serviceName.toLowerCase();
    if (name.includes('user')) return <Users className="w-6 h-6 text-green-600" />;
    if (name.includes('payment')) return <ShoppingCart className="w-6 h-6 text-purple-600" />;
    if (name.includes('order')) return <ShoppingCart className="w-6 h-6 text-orange-600" />;
    if (name.includes('notification')) return <Bell className="w-6 h-6 text-yellow-600" />;
    if (name.includes('database')) return <Database className="w-6 h-6 text-indigo-600" />;
    if (name.includes('api')) return <Shield className="w-6 h-6 text-blue-600" />;
    if (name.includes('monitoring')) return <Zap className="w-6 h-6 text-teal-600" />;
    return <Server className="w-6 h-6 text-gray-600" />;
  };

  const handleGenerateCode = async (serviceName: string) => {
    setLoading(true);
    try {
      await apiService.generateCodeForService(serviceName);
      
      // Update local status
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'In Progress', lastUpdated: new Date().toISOString() }
          : service
      ));

      // Start polling for status updates
      pollServiceStatus(serviceName);
    } catch (error) {
      console.error('Failed to generate code:', error);
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status: 'Failed', lastUpdated: new Date().toISOString() }
          : service
      ));
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAll = async () => {
    setLoading(true);
    try {
      await apiService.generateCodeForAllServices();
      
      // Update all services to "In Progress"
      setServices(prev => prev.map(service => ({
        ...service,
        status: 'In Progress',
        lastUpdated: new Date().toISOString()
      })));

      // Start polling for all services
      services.forEach(service => pollServiceStatus(service.name));
    } catch (error) {
      console.error('Failed to generate code for all services:', error);
    } finally {
      setLoading(false);
    }
  };

  const pollServiceStatus = async (serviceName: string) => {
    const interval = setInterval(async () => {
      try {
        const statusResponse = await apiService.getServiceStatusWithMessage(serviceName);
        setServices(prev => prev.map(service => 
          service.name === serviceName 
            ? { 
                ...service, 
                status: statusResponse.status as 'Not Started' | 'In Progress' | 'Completed' | 'Failed',
                message: statusResponse.message,
                lastUpdated: new Date().toISOString() 
              }
            : service
        ));

        // Stop polling if completed or failed
        if (statusResponse.status.toLowerCase() === 'completed' || statusResponse.status.toLowerCase() === 'failed') {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Failed to get service status:', error);
        clearInterval(interval);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup after 5 minutes
    setTimeout(() => clearInterval(interval), 300000);
  };

  const handleRefreshStatus = async () => {
    if (!selectedService) return;
    
    try {
      setLoading(true);
      const statusResponse = await apiService.getServiceStatusWithMessage(selectedService);
      setServices(prev => prev.map(service => 
        service.name === selectedService 
          ? { 
              ...service, 
              status: statusResponse.status as 'Not Started' | 'In Progress' | 'Completed' | 'Failed',
              message: statusResponse.message,
              lastUpdated: new Date().toISOString() 
            }
          : service
      ));
    } catch (error) {
      console.error('Failed to refresh status:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshStatus = async (serviceName: string) => {
    try {
      const status = await apiService.getServiceStatus(serviceName);
      setServices(prev => prev.map(service => 
        service.name === serviceName 
          ? { ...service, status, lastUpdated: new Date().toISOString() }
          : service
      ));
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  const openInVSCode = (serviceName: string) => {
    // Open VS Code with the service directory
    const servicePath = `/Users/rmadiraju/workspace/r2p/generated-code/${serviceName}`;
    window.open(`vscode://file/${servicePath}`, '_blank');
  };

  const handleRegenerateCode = async (serviceName: string) => {
    // Reset status to "Not Started" and then generate
    setServices(prev => prev.map(service => 
      service.name === serviceName 
        ? { ...service, status: 'Not Started', lastUpdated: new Date().toISOString() }
        : service
    ));
    
    // Wait a moment then generate
    setTimeout(() => {
      handleGenerateCode(serviceName);
    }, 500);
  };

  return (
    <div className="h-full flex">
      {/* Left Side - Services List */}
      <div className="w-2/5 flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Services</h2>
          <p className="text-sm text-gray-600 mb-4">
            Select a service to view details and generate code
          </p>
          
          {/* Generate All Button */}
          <button
            onClick={handleGenerateAll}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Play className="w-4 h-4" />
            )}
            <span>Generate Code for All Services</span>
          </button>
        </div>

        {/* Services List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {services.map((service) => {
              const status = service.status;
              const details = serviceDetails.find(d => d.name === service.name);
              
              return (
                <div
                  key={service.name}
                  onClick={() => setSelectedService(service.name)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                    selectedService === service.name 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getServiceIcon(service.name)}
                      <div>
                        <h3 className="font-medium text-gray-900">{service.name}</h3>
                        <p className="text-sm text-gray-600">{service.technology}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(status)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                        {status}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Side - Service Details */}
      <div className="w-3/5 flex flex-col">
        {selectedService ? (
          <>
            {/* Service Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  {getServiceIcon(selectedService)}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{selectedService}</h2>
                    <p className="text-sm text-gray-600">
                      {serviceDetails.find(s => s.name === selectedService)?.technology}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRefreshStatus}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh Status
                </button>
              </div>
            </div>

            {/* Description - Moved to top */}
            <div className="bg-white border-b border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700">
                {serviceDetails.find(s => s.name === selectedService)?.description}
              </p>
            </div>

            {/* Technology Stack - Compact small section */}
            <div className="bg-white border-b border-gray-200 p-3">
              <div className="flex items-center gap-4 text-xs">
                <div>
                  <span className="text-gray-500 font-medium">Primary Technology:</span>
                  <span className="ml-1 text-gray-900">{serviceDetails.find(s => s.name === selectedService)?.technology || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Framework:</span>
                  <span className="ml-1 text-gray-900">{serviceDetails.find(s => s.name === selectedService)?.framework || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Database:</span>
                  <span className="ml-1 text-gray-900">{serviceDetails.find(s => s.name === selectedService)?.database || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-medium">Deployment:</span>
                  <span className="ml-1 text-gray-900">{serviceDetails.find(s => s.name === selectedService)?.deployment || 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Service Details */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Current Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {(() => {
                    const service = services.find(s => s.name === selectedService);
                    if (!service) return <p className="text-gray-500">No status available</p>;
                    
                    return (
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(service.status)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(service.status)}`}>
                            {service.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            Last updated: {new Date(service.lastUpdated).toLocaleString()}
                          </span>
                        </div>
                        {service.message && (
                          <div className="text-sm text-gray-700 bg-white p-3 rounded border">
                            <strong>Message:</strong> {service.message}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Generated Files Section */}
              {(() => {
                const service = services.find(s => s.name === selectedService);
                const details = serviceDetails.find(s => s.name === selectedService);
                
                if (service?.status === 'Completed' && details?.files) {
                  return (
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-3">Generated Files</h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {details.files.map((file, index) => (
                            <div key={index} className="flex items-center space-x-2 text-sm">
                              <Code className="w-4 h-4 text-blue-500" />
                              <span className="text-gray-700">{file}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Actions Section */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Actions</h3>
                <div className="flex space-x-3">
                  {(() => {
                    const service = services.find(s => s.name === selectedService);
                    if (!service) return null;

                    if (service.status === 'Completed') {
                      return (
                        <>
                          <button
                            onClick={() => openInVSCode(selectedService)}
                            className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 flex items-center space-x-2"
                          >
                            <Code className="w-4 h-4" />
                            <span>Open in VS Code</span>
                          </button>
                          <button
                            onClick={() => handleRegenerateCode(selectedService)}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Regenerate Code</span>
                          </button>
                        </>
                      );
                    }

                    if (service.status === 'Not Started' || service.status === 'Failed') {
                      return (
                        <button
                          onClick={() => handleGenerateCode(selectedService)}
                          disabled={loading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                          <Play className="w-4 h-4" />
                          <span>Generate Code</span>
                        </button>
                      );
                    }

                    if (service.status === 'In Progress') {
                      return (
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="text-sm">Generating...</span>
                        </div>
                      );
                    }

                    return null;
                  })()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Service</h3>
              <p className="text-gray-600">Click on any service in the left panel to view details and generate code.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Development; 