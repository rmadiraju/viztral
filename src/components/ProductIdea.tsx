import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  MessageSquare,
  Upload,
  Clock,
  FileText,
  BarChart3,
  ArrowRight,
  ArrowLeft,
  Eye,
  TrendingUp,
  Code,
  Server,
  Network,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  Users,
  Edit3,
  Save,
  Download,
  AlertCircle,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { apiService, type RequirementsData, type RequirementItem } from '../services/api';
import MermaidDiagram from './MermaidDiagram';

type Step = 'input' | 'analysis' | 'process' | 'requirements';

interface LegacyAnalysis {
  repository: string;
  totalFiles: number;
  languages: Record<string, number>;
  complexity: {
    high: number;
    medium: number;
    low: number;
  };
  modernizationScore: number;
  recommendations: string[];
  analysis: string;
  flowchart: string;
  metrics: any;
}

interface AnalysisRecommendation {
  legacy_business_processes: Array<{ name: string; description: string }>;
  recommended_business_processes: Array<{ name: string; description: string }>;
  legacy_architecture: Array<{ details: any }>;
  recommended_architecture: Array<{ details: any }>;
  legacy_api_catalog: Array<{ method: string; path: string; service_or_file: string; purpose: string; request_shape_hint: string; response_shape_hint: string }>;
  recommended_api_catalog: Array<{ method: string; path: string; service_or_file: string; purpose: string; request_shape_hint: string; response_shape_hint: string }>;
  legacy_technology_stack: { languages: string[]; additional_details: string };
  recommended_technology_stack: { languages: string[]; additional_details: string };
  risks_legacy: string[];
  advantages_new: string[];
}

const ProductIdea: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'legacy'>('legacy');
  const [currentStep, setCurrentStep] = useState<Step>('input');
  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  // Chat state
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: 'Hello! I\'m here to help you brainstorm and develop your product ideas. What\'s on your mind today?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Legacy analysis state
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStatus, setIsAnalysisStatus] = useState('');
  const [legacyAnalysis, setLegacyAnalysis] = useState<LegacyAnalysis | null>(null);
  
  // Requirements state
  const [requirements, setRequirements] = useState<RequirementsData | null>(null);
  const [loadingRequirements, setLoadingRequirements] = useState(false);
  const [savingRequirements, setSavingRequirements] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<RequirementItem>>({});
  
  // Cache for analysis results
  const [analysisCache, setAnalysisCache] = useState<Map<string, LegacyAnalysis>>(new Map());
  
  // Analysis recommendation state
  const [isGeneratingRecommendations, setIsGeneratingRecommendations] = useState(false);
  const [analysisRecommendation, setAnalysisRecommendation] = useState<AnalysisRecommendation | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);

  // Debug step changes
  useEffect(() => {
    console.log('🔄 Step changed to:', currentStep);
  }, [currentStep]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = { role: 'user' as const, content: inputMessage };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsSubmitting(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "That's an interesting idea! Let me help you explore this further. What specific problem are you trying to solve?",
        "Great concept! Have you considered the target audience and their pain points?",
        "I like the direction you're going. What would be the key features of this product?",
        "This sounds promising! Let's think about the technical requirements and architecture.",
        "Excellent idea! What's your timeline for development and launch?"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsSubmitting(false);
    }, 1000);
  };

    const handleRepositoryAnalysis = async () => {
    if (!repositoryUrl.trim()) return;
    
    // Check cache first
    const cacheKey = repositoryUrl.trim().toLowerCase();
    const cachedAnalysis = analysisCache.get(cacheKey);
    
    if (cachedAnalysis) {
      console.log('🎯 Using cached analysis for:', cacheKey);
      setLegacyAnalysis(cachedAnalysis);
      setCurrentStep('analysis');
      return;
    }
    
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setIsAnalysisStatus('Starting analysis...');

    try {
      // Check if backend is available
      try {
        const healthCheck = await apiService.getHealth();
        console.log('🏥 Backend health check:', healthCheck);
      } catch (error) {
        console.error('❌ Backend health check failed:', error);
        setIsAnalysisStatus('Backend not available. Please ensure SMEBuddy backend is running on localhost:8000');
        setIsAnalyzing(false);
        return;
      }

      // Test streaming endpoint directly
      try {
        console.log('🧪 Testing streaming endpoint directly...');
        const testResponse = await fetch('http://localhost:8000/generate/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: 'test', repo: 'test', prompt: 'test' })
        });
        console.log('🧪 Streaming endpoint test response status:', testResponse.status);
        console.log('🧪 Streaming endpoint test response ok:', testResponse.ok);
      } catch (testError) {
        console.error('❌ Streaming endpoint test failed:', testError);
      }

      // Parse repository URL to extract username and repo name
      const repoUrl = repositoryUrl.trim();
      let username: string | undefined;
      let repoName: string;

      if (repoUrl.includes('github.com/')) {
        const parts = repoUrl.split('github.com/')[1].split('/');
        username = parts[0];
        repoName = parts[1];
      } else {
        // Assume it's already in username/repo format
        const parts = repoUrl.split('/');
        if (parts.length === 2) {
          username = parts[0];
          repoName = parts[1];
        } else {
          username = undefined;
          repoName = repoUrl;
        }
      }

      // Step 1: Ingest repository
      setIsAnalysisStatus('Ingesting repository...');
      setAnalysisProgress(20);
      try {
        await apiService.ingestRepository(username, repoName);
        console.log('📊 Repository ingestion completed');
      } catch (ingestError) {
        console.warn('⚠️ Repository ingestion failed, continuing:', ingestError);
      }

      // Step 2: Prepare graph
      setIsAnalysisStatus('Preparing graph analysis...');
      setAnalysisProgress(40);
      try {
        await apiService.prepareGraph(username, repoName);
        console.log('📊 Graph preparation completed');
      } catch (graphError) {
        console.warn('⚠️ Graph preparation failed, continuing:', graphError);
      }

      // Step 3: Get modernization score
      setIsAnalysisStatus('Calculating modernization score...');
      setAnalysisProgress(60);
      let modernizationScoreData: any = { score: 50, details: [], recommendations: [] };
      try {
        modernizationScoreData = await apiService.getModernizationScore(username, repoName);
        console.log('📊 Modernization score data received:', modernizationScoreData);
      } catch (scoreError) {
        console.warn('⚠️ Modernization score call failed, using default data:', scoreError);
        modernizationScoreData = {
          score: 50,
          details: [],
          recommendations: ['Implement modern architecture patterns', 'Migrate to cloud-native technologies']
        };
      }

      // Step 4: Get metrics
      setIsAnalysisStatus('Gathering repository metrics...');
      setAnalysisProgress(80);
      let metricsData: any = {};
      try {
        metricsData = await apiService.getMetrics(username, repoName);
        console.log('📊 Metrics data received:', metricsData);
      } catch (metricsError) {
        console.warn('⚠️ Metrics call failed, using empty data:', metricsError);
        metricsData = {
          files_scanned_total: 0,
          language_breakdown: {}
        };
      }

            // Step 5: Stream analysis for comprehensive overview
      setIsAnalysisStatus('Generating comprehensive analysis...');
      setAnalysisProgress(90);
      
      let analysisContent = '';
      let flowchartContent = '';
      
      console.log('🔍 Starting streaming analysis for:', username, repoName);
      console.log('🔗 Backend URL:', 'http://localhost:8000');
      console.log('📡 Calling /generate/stream endpoint...');
      
      // Add timeout for streaming analysis
      const streamTimeout = setTimeout(() => {
        console.log('⏰ Streaming analysis timeout reached');
        if (!flowchartContent) {
          console.log('⚠️ No flowchart content received, using fallback');
        }
      }, 30000); // 30 second timeout
      
      try {
        await apiService.streamAnalysis(username, repoName, (update) => {
          console.log('📡 Stream update received:', update);
          
          if (update.content) {
            analysisContent += update.content;
            console.log('📝 Analysis content updated, length:', analysisContent.length);
          }
          
          if (update.status === 'complete' && update.diagram) {
            console.log('✅ Stream completed with diagram!');
            console.log('📊 Diagram length:', update.diagram.length);
            console.log('📊 Diagram preview:', update.diagram.substring(0, 200) + '...');
            flowchartContent = update.diagram;
            clearTimeout(streamTimeout);
          }
          
          if (update.progress) {
            setIsAnalysisStatus(update.progress);
          }
        });
      } catch (streamError) {
        console.error('❌ Streaming analysis failed:', streamError);
        // Continue with fallback diagram
      }
      
      clearTimeout(streamTimeout);

      console.log('🎯 Streaming analysis completed');
      console.log('📝 Final analysis content length:', analysisContent.length);
      console.log('📊 Final flowchart content length:', flowchartContent.length);
      console.log('📊 Flowchart content:', flowchartContent);

      // If no flowchart content from streaming, create a basic one
      if (!flowchartContent || flowchartContent.length < 50) {
        console.log('⚠️ No flowchart content from streaming, creating fallback diagram');
        flowchartContent = `graph TD
    A[Repository Analysis] --> B[Code Structure]
    A --> C[Architecture Overview]
    A --> D[Modernization Opportunities]

    B --> E[Legacy Code Files]
    B --> F[Modern Code Files]

    C --> G[Database Layer]
    C --> H[Business Logic]
    C --> I[User Interface]

    D --> J[Microservices Migration]
    D --> K[API Modernization]
    D --> L[Database Optimization]

    style A fill:#e1f5fe
    style D fill:#fff3e0
    style J fill:#e8f5e8
    style K fill:#e8f5e8
    style L fill:#e8f5e8`;
      }

      // Create analysis result
      const analysis: LegacyAnalysis = {
        repository: username ? `${username}/${repoName}` : repoName,
        totalFiles: metricsData.files_scanned_total || 0,
        languages: metricsData.language_breakdown || {},
        complexity: {
          high: (modernizationScoreData.details || []).filter((item: any) => item.migration_score < 30).length,
          medium: (modernizationScoreData.details || []).filter((item: any) => item.migration_score >= 30 && item.migration_score < 70).length,
          low: (modernizationScoreData.details || []).filter((item: any) => item.migration_score >= 70).length,
        },
        modernizationScore: Math.round(modernizationScoreData.score || 50),
        recommendations: modernizationScoreData.recommendations || ['Implement modern architecture patterns'],
        analysis: analysisContent,
        flowchart: flowchartContent,
        metrics: metricsData
      };

            console.log('📋 Created analysis result:');
      console.log('📊 Repository:', analysis.repository);
      console.log('📊 Total files:', analysis.totalFiles);
      console.log('📊 Analysis content length:', analysis.analysis?.length || 0);
      console.log('📊 Flowchart content length:', analysis.flowchart?.length || 0);
      console.log('📊 Has flowchart:', !!analysis.flowchart);

      setLegacyAnalysis(analysis);
      setAnalysisProgress(100);
      setIsAnalysisStatus('Analysis complete!');
      
      // Cache the analysis result
      setAnalysisCache(prev => new Map(prev).set(cacheKey, analysis));
      console.log('💾 Cached analysis result for:', cacheKey);
      
      // Move to analysis step
      console.log('🎯 About to change step from', currentStep, 'to analysis');
      setCurrentStep('analysis');
      console.log('🎯 Navigation: Moved to analysis step');
      console.log('🎯 Current step after setState:', currentStep); // This might still show old value due to async nature

    } catch (error) {
      console.error('Repository analysis failed:', error);
      setIsAnalysisStatus('Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startAnalysisRecommendation = async () => {
    if (!legacyAnalysis?.repository) {
      // Create mock recommendation data if no analysis exists
      const mockRecommendation: AnalysisRecommendation = {
        legacy_business_processes: [
          { name: 'Payment Processing', description: 'Legacy payment processing workflow' },
          { name: 'Order Management', description: 'Traditional order management system' }
        ],
        recommended_business_processes: [
          { name: 'Modern Payment API', description: 'RESTful payment processing API' },
          { name: 'Event-Driven Order System', description: 'Microservices-based order management' }
        ],
        legacy_architecture: [{ details: 'Monolithic architecture' }],
        recommended_architecture: [{ details: 'Microservices architecture' }],
        legacy_api_catalog: [],
        recommended_api_catalog: [],
        legacy_technology_stack: { languages: ['Java 8'], additional_details: 'Legacy stack' },
        recommended_technology_stack: { languages: ['Java 17', 'Spring Boot'], additional_details: 'Modern stack' },
        risks_legacy: ['Security vulnerabilities', 'Performance issues'],
        advantages_new: ['Better scalability', 'Improved security']
      };
      setAnalysisRecommendation(mockRecommendation);
      return;
    }
    
    setIsGeneratingRecommendations(true);
    setRecommendationError(null);
    
    try {
      // Extract project name from repository (use the repo name as project name)
      const projectName = legacyAnalysis.repository.split('/').pop() || 'legacy-project';
      
      // Start the analysis recommendation
      const response = await apiService.startAnalysisRecommendation(
        '/tmp/test', // Using the example repo_path from the requirements
        'claude',    // Using the example provider
        'gpt-4o-mini', // Using the example model
        projectName
      );
      
      // Start polling for status
      pollAnalysisStatus(response.job_id);
      
    } catch (error) {
      console.error('Failed to start analysis recommendation:', error);
      setRecommendationError('Failed to start analysis recommendation. Please try again.');
      setIsGeneratingRecommendations(false);
    }
  };

  const pollAnalysisStatus = async (jobId: string) => {
    // This function is kept for future use when analysis API is connected
    const pollInterval = 2000; // Poll every 2 seconds
    const maxAttempts = 30; // Maximum 60 seconds of polling
    let attempts = 0;
    
    const poll = async () => {
      try {
        const status = await apiService.getAnalysisStatus(jobId);
        
        if (status.status === 'completed' && status.result_json?.summary_json) {
          setAnalysisRecommendation(status.result_json.summary_json);
          setIsGeneratingRecommendations(false);
          setCurrentStep('process');
          return;
        } else if (status.status === 'failed' || status.error) {
          setRecommendationError(status.error || 'Analysis failed');
          setIsGeneratingRecommendations(false);
          return;
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, pollInterval);
        } else {
          setRecommendationError('Analysis timed out. Please try again.');
          setIsGeneratingRecommendations(false);
        }
      } catch (error) {
        console.error('Failed to poll analysis status:', error);
        setRecommendationError('Failed to check analysis status. Please try again.');
        setIsGeneratingRecommendations(false);
      }
    };
    
    poll();
  };

  const handleNext = () => {
    if (currentStep === 'input') {
      // Skip analysis step, go directly to process
      if (!analysisRecommendation) {
        startAnalysisRecommendation();
      } else {
        setCurrentStep('process');
      }
    } else if (currentStep === 'analysis') {
      // Start analysis recommendation instead of directly going to process
      startAnalysisRecommendation();
    } else if (currentStep === 'process') {
      setCurrentStep('requirements');
      loadRequirements();
    }
  };

  const handlePrevious = () => {
    if (currentStep === 'requirements') {
      setCurrentStep('process');
    } else if (currentStep === 'process') {
      setCurrentStep('input');
    } else if (currentStep === 'analysis') {
      setCurrentStep('input');
    }
  };

  const loadRequirements = async () => {
    if (!legacyAnalysis?.repository) return;
    
    try {
      setLoadingRequirements(true);
      const [username, repoName] = apiService['parseRepoString'](legacyAnalysis.repository);
      const data = await apiService.getRequirements(username, repoName);
      setRequirements(data);
      // Expand all sections by default
      setExpandedSections(new Set(data.sections.map(s => s.id)));
    } catch (error) {
      console.error('Failed to load requirements:', error);
      // Create mock requirements if API fails
      setRequirements({
        repo: legacyAnalysis.repository,
        version: '1.0.0',
        sections: [
          {
            id: 'functional',
            title: 'Functional Requirements',
            description: 'Core functionality requirements for the modernized system',
            items: [
              {
                id: 'req-1',
                title: 'User Authentication System',
                description: 'Implement secure user authentication with multi-factor authentication support',
                priority: 'critical',
                status: 'draft',
                category: 'security'
              },
              {
                id: 'req-2',
                title: 'Data Migration Tool',
                description: 'Create automated data migration from legacy COBOL systems to modern database',
                priority: 'high',
                status: 'draft',
                category: 'technical'
              }
            ]
          },
          {
            id: 'non-functional',
            title: 'Non-Functional Requirements',
            description: 'Performance, security, and operational requirements',
            items: [
              {
                id: 'req-3',
                title: 'Performance Optimization',
                description: 'Ensure system can handle 1000+ concurrent users with sub-second response times',
                priority: 'high',
                status: 'draft',
                category: 'performance'
              },
              {
                id: 'req-4',
                title: 'Security Compliance',
                description: 'Implement PCI DSS and SOX compliance measures',
                priority: 'critical',
                status: 'draft',
                category: 'security'
              }
            ]
          }
        ],
        last_updated: new Date().toISOString()
      });
    } finally {
      setLoadingRequirements(false);
    }
  };

  const saveRequirements = async () => {
    if (!requirements || !legacyAnalysis?.repository) return;
    
    try {
      setSavingRequirements(true);
      const [username, repoName] = apiService['parseRepoString'](legacyAnalysis.repository);
      await apiService.saveRequirements(username, repoName, requirements);
      // Update last_updated timestamp
      setRequirements(prev => prev ? {
        ...prev,
        last_updated: new Date().toISOString()
      } : null);
    } catch (error) {
      console.error('Failed to save requirements:', error);
    } finally {
      setSavingRequirements(false);
    }
  };

  const exportRequirements = async (format: 'json' | 'markdown') => {
    if (!requirements || !legacyAnalysis?.repository) return;
    
    try {
      const [username, repoName] = apiService['parseRepoString'](legacyAnalysis.repository);
      const data = await apiService.exportRequirements(username, repoName, format);
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requirements-${repoName}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'markdown') {
        const blob = new Blob([data.content], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `requirements-${repoName}.md`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export requirements:', error);
    }
  };

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const startEditing = (item: RequirementItem) => {
    setEditingItem(item.id);
    setEditForm(item);
  };

  const saveEdit = () => {
    if (!requirements || !editingItem) return;

    const updatedRequirements = {
      ...requirements,
      sections: requirements.sections.map(section => ({
        ...section,
        items: section.items.map(item => 
          item.id === editingItem ? { ...item, ...editForm } : item
        )
      }))
    };

    setRequirements(updatedRequirements);
    setEditingItem(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({});
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'implemented': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'approved': return <CheckCircle className="w-4 h-4 text-blue-600" />;
      case 'draft': return <Clock className="w-4 h-4 text-gray-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="flex h-full overflow-hidden">
      <div className="w-full flex flex-col h-full">
                {/* Header */}
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Left side - Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Lightbulb className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Modernization Legacy Systems</h1>
                <p className="text-sm text-gray-600">Transform legacy systems into modern requirements</p>
              </div>
            </div>
            
            {/* Right side - Navigation Icons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setActiveTab('chat')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'chat'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
                title="New Ideas"
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setActiveTab('legacy')}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  activeTab === 'legacy'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
                }`}
                title="Legacy Modernization"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto scrollbar-visible">
          {activeTab === 'chat' && (
            <div className="max-w-4xl mx-auto p-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 min-h-[40vh] max-h-[50vh] flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg px-4 py-2 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                  {isSubmitting && (
                    <div className="flex justify-start">
                      <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="border-t border-gray-200 p-4 flex-shrink-0">
                  <div className="flex space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={isSubmitting}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isSubmitting}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'legacy' && (
            <div className="max-w-7xl mx-auto p-6">
              {/* Step Navigation */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 ${currentStep === 'input' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'input' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      1
                    </div>
                    <span className="font-medium">Select Project</span>
                  </div>
                  {/* Hidden Analysis step - kept for future use */}
                  <ArrowRight className="w-5 h-5 text-gray-400 hidden" />
                  <div className={`flex items-center space-x-2 hidden ${currentStep === 'analysis' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'analysis' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      2
                    </div>
                    <span className="font-medium">Repository Analysis</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center space-x-2 ${currentStep === 'process' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'process' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      2
                    </div>
                    <span className="font-medium">Recommended Process</span>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <div className={`flex items-center space-x-2 ${currentStep === 'requirements' ? 'text-blue-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep === 'requirements' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                      3
                    </div>
                    <span className="font-medium">Requirements</span>
                  </div>
                </div>
              </div>

              {/* Step Content */}
              {currentStep === 'input' && (
                <div className="max-w-4xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Select Project for Modernization</h1>
                    <p className="text-lg text-gray-600">Choose a project that CTO has approved for modernization</p>
                  </div>

                  {/* Projects List */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="space-y-3">
                      {[
                        { 
                          project: 'Mainframe Payment System', 
                          owner: 'Sarah Johnson', 
                          priority: 9.2, 
                          sixR: 'Refactor', 
                          wave: 1,
                          recentlyApproved: true,
                          approvedDate: '2024-01-15'
                        },
                        { 
                          project: 'Legacy ETL Pipeline', 
                          owner: 'Michael Chen', 
                          priority: 8.8, 
                          sixR: 'Replatform', 
                          wave: 2,
                          recentlyApproved: false
                        },
                        { 
                          project: 'Monolith Order Service', 
                          owner: 'Alex Rodriguez', 
                          priority: 8.5, 
                          sixR: 'Refactor', 
                          wave: 1,
                          recentlyApproved: false
                        },
                        { 
                          project: 'COBOL Financial Core', 
                          owner: 'Emily Watson', 
                          priority: 9.5, 
                          sixR: 'Rewrite', 
                          wave: 1,
                          recentlyApproved: true,
                          approvedDate: '2024-01-20'
                        },
                        { 
                          project: 'Legacy Database Cluster', 
                          owner: 'Lisa Anderson', 
                          priority: 7.8, 
                          sixR: 'Replatform', 
                          wave: 2,
                          recentlyApproved: false
                        }
                      ].map((proj, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setSelectedProject(proj.project);
                            // Set mock repository URL for the selected project
                            setRepositoryUrl(`${proj.project.toLowerCase().replace(/\s+/g, '-')}`);
                            // Create mock legacy analysis
                            const mockAnalysis: LegacyAnalysis = {
                              repository: proj.project,
                              totalFiles: 150,
                              languages: { 'Java': 80, 'SQL': 20 },
                              complexity: { high: 30, medium: 50, low: 20 },
                              modernizationScore: 75,
                              recommendations: ['Migrate to microservices', 'Update to modern framework'],
                              analysis: `Analysis for ${proj.project}`,
                              flowchart: '',
                              metrics: {}
                            };
                            setLegacyAnalysis(mockAnalysis);
                            // Navigate directly to process step
                            setCurrentStep('process');
                            // Start generating recommendations
                            setTimeout(() => startAnalysisRecommendation(), 500);
                          }}
                          className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                            proj.recentlyApproved 
                              ? 'border-green-500 bg-green-50 hover:bg-green-100' 
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h3 className="text-lg font-semibold text-gray-900">{proj.project}</h3>
                                {proj.recentlyApproved && (
                                  <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full flex items-center space-x-1">
                                    <CheckCircle className="w-3 h-3" />
                                    <span>Recently Approved</span>
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                                <span>Owner: <span className="font-medium">{proj.owner}</span></span>
                                <span>Priority: <span className="font-medium">{proj.priority}</span></span>
                                <span>6R: <span className="font-medium">{proj.sixR}</span></span>
                                <span>Wave: <span className="font-medium">{proj.wave}</span></span>
                                {proj.recentlyApproved && proj.approvedDate && (
                                  <span className="text-green-600 font-medium">Approved: {proj.approvedDate}</span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'analysis' && legacyAnalysis && (
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Repository Analysis</h1>
                    <p className="text-lg text-gray-600">Comprehensive analysis of your legacy system</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      onClick={handleNext}
                      disabled={isGeneratingRecommendations}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                    >
                      {isGeneratingRecommendations ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          <span>Generating Recommendations...</span>
                        </>
                      ) : (
                        <>
                          <span>Next: Recommended Process</span>
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </button>
                  </div>

                  {/* Error Display */}
                  {recommendationError && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                        <span className="text-red-700 font-medium">Error:</span>
                      </div>
                      <p className="text-red-600 mt-1">{recommendationError}</p>
                      <button
                        onClick={() => setRecommendationError(null)}
                        className="mt-2 px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200 transition-colors"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}

                  {/* Analysis Overview */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-blue-600" />
                        Repository Overview
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Repository:</span>
                          <span className="font-medium">{legacyAnalysis.repository}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Files:</span>
                          <span className="font-medium">{legacyAnalysis.totalFiles}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Modernization Score:</span>
                          <span className="font-medium">{legacyAnalysis.modernizationScore}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-green-600" />
                        Complexity Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-red-600">High Complexity:</span>
                          <span className="font-medium">{legacyAnalysis.complexity.high}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-yellow-600">Medium Complexity:</span>
                          <span className="font-medium">{legacyAnalysis.complexity.medium}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-green-600">Low Complexity:</span>
                          <span className="font-medium">{legacyAnalysis.complexity.low}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <Code className="w-5 h-5 mr-2 text-purple-600" />
                        Language Breakdown
                      </h3>
                      <div className="space-y-2">
                        {Object.entries(legacyAnalysis.languages).slice(0, 5).map(([lang, count]) => (
                          <div key={lang} className="flex justify-between">
                            <span className="text-gray-600">{lang}:</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Mermaid Diagram */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <Eye className="w-5 h-5 mr-2 text-blue-600" />
                      System Architecture Overview
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 min-h-96">
                      {legacyAnalysis.flowchart && (
                        <>
                          <div className="mb-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Live diagram from streaming analysis</span>
                            </div>
                          </div>
                          {console.log('🎨 Rendering Mermaid diagram with content length:', legacyAnalysis.flowchart.length)}
                          <MermaidDiagram chart={legacyAnalysis.flowchart} />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

                            {currentStep === 'process' && legacyAnalysis && (
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Process Modernization Strategy</h1>
                    <p className="text-lg text-gray-600">High-level recommendations for modernizing your business processes</p>
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    
                    <button
                      onClick={handleNext}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                    >
                      <span>Next: Requirements</span>
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Process Modernization Overview */}
                  {analysisRecommendation ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Legacy Business Processes */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <BarChart3 className="w-6 h-6 mr-2 text-red-500" />
                          Legacy Business Processes
                        </h3>
                        <div className="space-y-4">
                          {analysisRecommendation.legacy_business_processes.map((process, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="font-semibold text-red-800 mb-2">{process.name}</h4>
                              <p className="text-sm text-red-700">{process.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Business Processes */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Zap className="w-6 h-6 mr-2 text-green-500" />
                          Recommended Business Processes
                        </h3>
                        <div className="space-y-4">
                          {analysisRecommendation.recommended_business_processes.map((process, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-800 mb-2">{process.name}</h4>
                              <p className="text-sm text-green-700">{process.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Fallback content when no analysis recommendation is available */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <BarChart3 className="w-6 h-6 mr-2 text-red-500" />
                          Current Process Challenges
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Manual Processes</h4>
                            <ul className="text-sm text-red-700 space-y-1">
                              <li>• Paper-based workflows</li>
                              <li>• Manual data entry</li>
                              <li>• Error-prone operations</li>
                              <li>• Slow processing times</li>
                            </ul>
                          </div>
                          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h4 className="font-semibold text-orange-800 mb-2">Legacy Systems</h4>
                            <ul className="text-sm text-orange-700 space-y-1">
                              <li>• Outdated technology stack</li>
                              <li>• Limited integration capabilities</li>
                              <li>• High maintenance costs</li>
                              <li>• Scalability constraints</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Zap className="w-6 h-6 mr-2 text-green-500" />
                          Modernized Process Benefits
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-2">Automation & Efficiency</h4>
                            <ul className="text-sm text-green-700 space-y-1">
                              <li>• Automated workflows</li>
                              <li>• Real-time processing</li>
                              <li>• Reduced manual errors</li>
                              <li>• Faster turnaround times</li>
                            </ul>
                          </div>
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h4 className="font-semibold text-blue-800 mb-2">Digital Transformation</h4>
                            <ul className="text-sm text-blue-700 space-y-1">
                              <li>• Cloud-native solutions</li>
                              <li>• API-first architecture</li>
                              <li>• Seamless integrations</li>
                              <li>• Scalable infrastructure</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Architecture Comparison */}
                  {analysisRecommendation && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Legacy Architecture */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Server className="w-6 h-6 mr-2 text-red-500" />
                          Legacy Architecture
                        </h3>
                        <div className="space-y-4">
                          {analysisRecommendation.legacy_architecture.map((arch, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                              <h4 className="font-semibold text-red-800 mb-2">{arch.details.pattern}</h4>
                              <div className="text-sm text-red-700 space-y-2">
                                <div><strong>Presentation:</strong> {arch.details.presentation}</div>
                                <div><strong>Business Logic:</strong> {arch.details.business_logic}</div>
                                <div><strong>Data Access:</strong> {arch.details.data_access}</div>
                                <div><strong>Deployment:</strong> {arch.details.deployment}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Architecture */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Network className="w-6 h-6 mr-2 text-green-500" />
                          Recommended Architecture
                        </h3>
                        <div className="space-y-4">
                          {analysisRecommendation.recommended_architecture.map((arch, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                              <h4 className="font-semibold text-green-800 mb-2">{arch.details.pattern}</h4>
                              <div className="text-sm text-green-700 space-y-2">
                                <div><strong>API Gateway:</strong> {arch.details.api_gateway}</div>
                                <div><strong>Frontend:</strong> {arch.details.frontend}</div>
                                <div><strong>Databases:</strong> {arch.details.databases}</div>
                                <div><strong>Deployment:</strong> {arch.details.deployment}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Technology Stack Comparison */}
                  {analysisRecommendation && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Legacy Technology Stack */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Code className="w-6 h-6 mr-2 text-red-500" />
                          Legacy Technology Stack
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <h4 className="font-semibold text-red-800 mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisRecommendation.legacy_technology_stack.languages.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-red-200 text-red-800 text-xs rounded">
                                  {lang}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-red-700 mt-2">{analysisRecommendation.legacy_technology_stack.additional_details}</p>
                          </div>
                        </div>
                      </div>

                      {/* Recommended Technology Stack */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <Zap className="w-6 h-6 mr-2 text-green-500" />
                          Recommended Technology Stack
                        </h3>
                        <div className="space-y-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-2">Languages</h4>
                            <div className="flex flex-wrap gap-2">
                              {analysisRecommendation.recommended_technology_stack.languages.map((lang, index) => (
                                <span key={index} className="px-2 py-1 bg-green-200 text-green-800 text-xs rounded">
                                  {lang}
                                </span>
                              ))}
                            </div>
                            <p className="text-sm text-green-700 mt-2">{analysisRecommendation.recommended_technology_stack.additional_details}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Risks and Advantages */}
                  {analysisRecommendation && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                      {/* Legacy Risks */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <AlertCircle className="w-6 h-6 mr-2 text-red-500" />
                          Legacy System Risks
                        </h3>
                        <div className="space-y-2">
                          {analysisRecommendation.risks_legacy.map((risk, index) => (
                            <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-3">
                              <p className="text-sm text-red-700">• {risk}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* New System Advantages */}
                      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                          <CheckCircle className="w-6 h-6 mr-2 text-green-500" />
                          Modern System Advantages
                        </h3>
                        <div className="space-y-2">
                          {analysisRecommendation.advantages_new.map((advantage, index) => (
                            <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-3">
                              <p className="text-sm text-green-700">• {advantage}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Industry Standards & Best Practices */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <Shield className="w-7 h-7 mr-3 text-blue-600" />
                      Industry Standards & Best Practices
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Digital Transformation */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-3">
                            <Globe className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-blue-900">Digital Transformation</h4>
                            <p className="text-sm text-blue-700">Industry Standard</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-blue-800 text-sm mb-1">Why Recommended</h5>
                            <p className="text-xs text-blue-700">90% of Fortune 500 companies have adopted digital transformation strategies</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-blue-800 text-sm mb-1">Expected ROI</h5>
                            <p className="text-xs text-blue-700">40-60% cost reduction, 70% faster processes</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-blue-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-blue-700">85% of financial institutions</p>
                          </div>
                        </div>
                      </div>

                      {/* Process Automation */}
                      <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-3">
                            <Zap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-900">Process Automation</h4>
                            <p className="text-sm text-green-700">Best Practice</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-green-800 text-sm mb-1">Why Recommended</h5>
                            <p className="text-xs text-green-700">Reduces errors by 90% and increases efficiency by 60%</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-green-800 text-sm mb-1">Expected ROI</h5>
                            <p className="text-xs text-green-700">50-80% time savings, 95% accuracy improvement</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-green-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-green-700">92% of leading enterprises</p>
                          </div>
                        </div>
                      </div>

                      {/* Compliance & Security */}
                      <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mr-3">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-red-900">Compliance & Security</h4>
                            <p className="text-sm text-red-700">Regulatory Requirement</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-red-800 text-sm mb-1">Why Required</h5>
                            <p className="text-xs text-red-700">Mandatory for financial services, prevents $2.9M average breach cost</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-red-800 text-sm mb-1">Compliance Standards</h5>
                            <p className="text-xs text-red-700">PCI DSS, SOX, GDPR, ISO 27001</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-red-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-red-700">100% of regulated industries</p>
                          </div>
                        </div>
                      </div>

                      {/* Cloud Migration */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-3">
                            <BarChart3 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-purple-900">Cloud Migration</h4>
                            <p className="text-sm text-purple-700">Strategic Initiative</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-purple-800 text-sm mb-1">Why Recommended</h5>
                            <p className="text-xs text-purple-700">Enables scalability, reduces infrastructure costs by 40%</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-purple-800 text-sm mb-1">Expected ROI</h5>
                            <p className="text-xs text-purple-700">30-50% cost reduction, 99.9% uptime</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-purple-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-purple-700">94% of enterprises</p>
                          </div>
                        </div>
                      </div>

                      {/* API-First Architecture */}
                      <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-3">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-yellow-900">API-First Design</h4>
                            <p className="text-sm text-yellow-700">Modern Standard</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-yellow-800 text-sm mb-1">Why Recommended</h5>
                            <p className="text-xs text-yellow-700">Enables seamless integration, faster development cycles</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-yellow-800 text-sm mb-1">Expected ROI</h5>
                            <p className="text-xs text-yellow-700">60% faster integration, 80% reusability</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-yellow-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-yellow-700">88% of modern applications</p>
                          </div>
                        </div>
                      </div>

                      {/* Data Analytics */}
                      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-lg p-6">
                        <div className="flex items-center mb-4">
                          <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mr-3">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-indigo-900">Data Analytics</h4>
                            <p className="text-sm text-indigo-700">Strategic Advantage</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-indigo-800 text-sm mb-1">Why Recommended</h5>
                            <p className="text-xs text-indigo-700">Provides actionable insights, improves decision-making</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-indigo-800 text-sm mb-1">Expected ROI</h5>
                            <p className="text-xs text-indigo-700">25% revenue increase, 30% cost optimization</p>
                          </div>
                          <div className="bg-white rounded p-3">
                            <h5 className="font-semibold text-indigo-800 text-sm mb-1">Industry Adoption</h5>
                            <p className="text-xs text-indigo-700">96% of data-driven organizations</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 'requirements' && legacyAnalysis && (
                <div className="max-w-7xl mx-auto">
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Product Requirements</h1>
                    <p className="text-lg text-gray-600">
                      Review and customize the product requirements for your modernization project.
                      These requirements are based on industry best practices and can be modified to fit your specific needs.
                    </p>
                    {requirements?.last_updated && (
                      <p className="text-sm text-gray-500 mt-2">
                        Last updated: {new Date(requirements.last_updated).toLocaleString()}
                      </p>
                    )}
                  </div>

                  {/* Navigation */}
                  <div className="flex justify-between items-center mb-6">
                    <button
                      onClick={handlePrevious}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => exportRequirements('json')}
                        title="Export as JSON"
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 group hover:shadow-sm"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                      </button>
                      <button
                        onClick={() => exportRequirements('markdown')}
                        title="Export as Markdown"
                        className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 group hover:shadow-sm"
                      >
                        <Download className="w-5 h-5 text-gray-600 group-hover:text-gray-800" />
                      </button>
                      <button
                        onClick={saveRequirements}
                        disabled={savingRequirements}
                        title={savingRequirements ? "Saving..." : "Save Changes"}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 disabled:opacity-50 group hover:shadow-sm"
                      >
                        {savingRequirements ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <Save className="w-5 h-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          // TODO: Implement submit to architecture functionality
                          alert('Requirements submitted to Architecture team!');
                        }}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center space-x-2"
                      >
                        <ArrowRight className="w-4 h-4" />
                        <span>Submit to Architecture</span>
                      </button>
                    </div>
                  </div>

                  {loadingRequirements ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading requirements...</p>
                      </div>
                    </div>
                  ) : !requirements ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <p className="text-gray-600">Failed to load requirements</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {requirements.sections.map((section) => (
                        <div key={section.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                          {/* Section Header */}
                          <div 
                            className="flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                            onClick={() => toggleSection(section.id)}
                          >
                            <div className="flex items-center space-x-3">
                              {expandedSections.has(section.id) ? (
                                <ChevronDown className="w-5 h-5 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-gray-500" />
                              )}
                              <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
                              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                {section.items.length} items
                              </span>
                            </div>
                            {section.description && (
                              <p className="text-sm text-gray-600 max-w-md">{section.description}</p>
                            )}
                          </div>

                          {/* Section Content */}
                          {expandedSections.has(section.id) && (
                            <div className="border-t border-gray-200">
                              {section.items.map((item) => (
                                <div key={item.id} className="p-6 border-b border-gray-100 last:border-b-0">
                                  {editingItem === item.id ? (
                                    /* Edit Form */
                                    <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                          <input
                                            type="text"
                                            value={editForm.title || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          />
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                          <select
                                            value={editForm.category || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, category: e.target.value as 'functional' | 'technical' | 'performance' | 'security' }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="functional">Functional</option>
                                            <option value="technical">Technical</option>
                                            <option value="performance">Performance</option>
                                            <option value="security">Security</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                        <textarea
                                          value={editForm.description || ''}
                                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                                          rows={3}
                                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                                          <select
                                            value={editForm.priority || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, priority: e.target.value as any }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="critical">Critical</option>
                                            <option value="high">High</option>
                                            <option value="medium">Medium</option>
                                            <option value="low">Low</option>
                                          </select>
                                        </div>
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                          <select
                                            value={editForm.status || ''}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, status: e.target.value as any }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                          >
                                            <option value="draft">Draft</option>
                                            <option value="approved">Approved</option>
                                            <option value="implemented">Implemented</option>
                                          </select>
                                        </div>
                                      </div>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={saveEdit}
                                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                                        >
                                          Save
                                        </button>
                                        <button
                                          onClick={cancelEdit}
                                          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                                        >
                                          Cancel
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    /* Display Mode */
                                    <div className="space-y-4">
                                      <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center space-x-3 mb-2">
                                            <h4 className="text-lg font-semibold text-gray-900">{item.title}</h4>
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor(item.priority)}`}>
                                              {item.priority}
                                            </span>
                                            <div className="flex items-center space-x-1">
                                              {getStatusIcon(item.status)}
                                              <span className="text-sm text-gray-600">{item.status}</span>
                                            </div>
                                          </div>
                                          <p className="text-gray-700 mb-3">{item.description}</p>
                                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                                            <span className="px-2 py-1 bg-gray-100 rounded">Category: {item.category}</span>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => startEditing(item)}
                                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                          title="Edit requirement"
                                        >
                                          <Edit3 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductIdea; 