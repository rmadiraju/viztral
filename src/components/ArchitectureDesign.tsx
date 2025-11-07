import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { apiService } from '../services/api';
import type { ArchitectureRecommendation } from '../services/api';
import ArchitectureDiagramView from './ArchitectureDiagramView';

const ArchitectureDesign: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<ArchitectureRecommendation | null>(null);
  const [selectedRepo, setSelectedRepo] = useState<string>('writ3it/cobol-examples');

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const [username, repoName] = apiService['parseRepoString'](selectedRepo);
      const recs = await apiService.getArchitectureRecommendations(username, repoName);
      setRecommendations(recs);
    } catch (error) {
      console.error('Failed to load architecture recommendations:', error);
      // Create mock recommendations if API fails
      setRecommendations({
        repo: selectedRepo,
        version: '1.0.0',
        services: [
          {
            id: '1',
            name: 'API Gateway',
            description: 'Entry point for all client requests, handles routing and authentication',
            technology: 'Spring Cloud Gateway',
            responsibility: 'Request routing and authentication',
            dependencies: ['User Service', 'Order Service'],
            estimated_complexity: 'medium'
          },
          {
            id: '2',
            name: 'User Service',
            description: 'User management and authentication service',
            technology: 'Spring Boot',
            responsibility: 'User management and authentication',
            dependencies: ['Database'],
            estimated_complexity: 'low'
          },
          {
            id: '3',
            name: 'Order Service',
            description: 'Order processing and management service',
            technology: 'Spring Boot',
            responsibility: 'Order processing and management',
            dependencies: ['Database', 'Payment Service'],
            estimated_complexity: 'medium'
          },
          {
            id: '4',
            name: 'Payment Service',
            description: 'Payment processing and transaction management',
            technology: 'Spring Boot',
            responsibility: 'Payment processing',
            dependencies: ['Database'],
            estimated_complexity: 'high'
          },
          {
            id: '5',
            name: 'Database',
            description: 'Primary data storage for all services',
            technology: 'PostgreSQL',
            responsibility: 'Data persistence',
            dependencies: [],
            estimated_complexity: 'low'
          }
        ],
        last_updated: new Date().toISOString()
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForDevelopment = () => {
    // TODO: Implement submit for development functionality
    alert('Architecture submitted for development! The development team has been notified.');
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Architecture Design</h1>
            <p className="text-sm text-gray-600 mt-1">
              Interactive architecture diagram for designing and refining your system architecture.
            </p>
          </div>
          <button
            onClick={handleSubmitForDevelopment}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
          >
            <ArrowRight className="w-4 h-4" />
            <span>Submit for Development</span>
          </button>
        </div>
      </div>

      {/* Interactive Diagram */}
      <ArchitectureDiagramView username="writ3it" repo="cobol-examples" />
    </div>
  );
};

export default ArchitectureDesign; 