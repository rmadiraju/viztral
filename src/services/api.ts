// API service for integrating with SMEBuddy backend
const BACKEND_URL = 'http://localhost:8000';

export interface RepositoryData {
  username?: string;
  repo: string;
  githubUrl?: string;
  explanation?: string;
  diagrams?: {
    architecture?: string;
    module?: string;
    process?: string;
  };
  glossary?: any[];
  modernizationScore?: number;
  stranglerPlan?: any;
  tests?: any[];
  generatedCode?: any;
  flowchart?: string;
  metrics?: any;
}

export interface IngestResponse {
  success: boolean;
  message: string;
  repo: string;
}

export interface GraphViewResponse {
  mermaid: string;
  metadata?: any;
}

export interface ModernizationScoreResponse {
  score: number;
  details: any[];
  recommendations: string[];
}

export interface GlossaryResponse {
  terms: any[];
  total: number;
}

export interface StranglerPlanResponse {
  phases: any[];
  timeline: string;
  benefits: string[];
}

export interface TestGenerationResponse {
  tests: any[];
  coverage: number;
  strategies: string[];
}

export interface CodeGenerationResponse {
  code: string;
  language: string;
  improvements: string[];
  description: string;
}

// Requirements API interfaces
export interface RequirementItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'approved' | 'implemented';
  category: 'functional' | 'technical' | 'performance' | 'security';
}

export interface RequirementSection {
  id: string;
  title: string;
  description?: string;
  items: RequirementItem[];
}

export interface RequirementsData {
  repo: string;
  sections: RequirementSection[];
  version: string;
  last_updated?: string;
}

// Architecture interfaces
export interface ArchitectureService {
  id: string;
  name: string;
  description: string;
  technology: string;
  responsibility: string;
  dependencies: string[];
  estimated_complexity: string;
}

export interface ArchitectureRecommendation {
  repo: string;
  services: ArchitectureService[];
  version: string;
  last_updated?: string;
}

export interface ArchitectureDiagramNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    description: string;
    technology: string;
  };
}

export interface ArchitectureDiagramEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
  data?: any;
}

export interface ArchitectureDiagram {
  repo: string;
  nodes: ArchitectureDiagramNode[];
  edges: ArchitectureDiagramEdge[];
  version: string;
  last_updated?: string;
}

export interface ArchitectureDiagram {
  repo: string;
  nodes: ArchitectureDiagramNode[];
  edges: ArchitectureDiagramEdge[];
  version: string;
  last_updated?: string;
}

// Graph interfaces (keeping existing ones)
export interface GraphNode {
  id: string;
  label: string;
  type: string;
  language?: string;
  complexity?: number;
  size?: number;
  x?: number;
  y?: number;
  color?: string;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  type: string;
  label?: string;
}

export interface ModernizationScore {
  score: number;
  details: any[];
  recommendations: string[];
}

class ApiService {
  private formatRepoParam(username: string | undefined, repo: string): string {
    // If username is empty or undefined, just return the repo name
    if (!username || !username.trim()) {
      return repo.trim();
    }
    // Otherwise return username/repo format
    return `${username.trim()}/${repo.trim()}`;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BACKEND_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        credentials: 'include', // Include cookies in all requests
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        // Handle 401 Unauthorized - redirect to login
        if (response.status === 401) {
          // Clear any stored authentication state
          localStorage.removeItem('auth_token');
          // Redirect to login page
          window.location.href = '/';
          throw new Error('Authentication required. Please login again.');
        }
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Repository ingestion and analysis
  async ingestRepository(username: string | undefined, repo: string): Promise<IngestResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<IngestResponse>(`/github/ingest?repo=${encodeURIComponent(repoParam)}`, {
      method: 'POST',
    });
  }

  async getRepositoryTree(username: string | undefined, repo: string): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/github/tree?repo=${encodeURIComponent(repoParam)}`);
  }

  async prepareGraph(username: string | undefined, repo: string): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/prepare?repo=${encodeURIComponent(repoParam)}`, {
      method: 'POST',
    });
  }

  async getProgress(username: string | undefined, repo: string): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/progress?repo=${encodeURIComponent(repoParam)}`);
  }

  // Graph views and diagrams
  async getGraphView(username: string | undefined, repo: string, viewType: 'architecture' | 'module' | 'process'): Promise<GraphViewResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<GraphViewResponse>(
      `/graph/view?repo=${encodeURIComponent(repoParam)}&view_type=${viewType}&file_limit=600&disable_clustering=false&drilldown_depth=1`
    );
  }

  async getNodes(username: string | undefined, repo: string, limit: number = 1000): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/nodes?repo=${encodeURIComponent(repoParam)}&limit=${limit}`);
  }

  async getEdges(username: string | undefined, repo: string, limit: number = 5000): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/edges?repo=${encodeURIComponent(repoParam)}&limit=${limit}`);
  }

  // Glossary
  async buildGlossary(username: string | undefined, repo: string): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/glossary/build?repo=${encodeURIComponent(repoParam)}`, {
      method: 'POST',
    });
  }

  async getGlossary(username: string | undefined, repo: string): Promise<GlossaryResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<GlossaryResponse>(`/graph/glossary?repo=${encodeURIComponent(repoParam)}`);
  }

  // Modernization
  async getModernizationScore(username: string | undefined, repo: string): Promise<ModernizationScoreResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<ModernizationScoreResponse>(
      `/modernization/score?repo=${encodeURIComponent(repoParam)}&limit=200&cache_ttl_sec=900&refresh=false`
    );
  }

  async getStranglerPlan(username: string | undefined, repo: string): Promise<StranglerPlanResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<StranglerPlanResponse>(
      `/modernization/strangler/plan?repo=${encodeURIComponent(repoParam)}&strategy=endpoints&limit=50&cache_ttl_sec=900&refresh=false`,
      { method: 'POST' }
    );
  }

  async generateTests(username: string | undefined, repo: string): Promise<TestGenerationResponse> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest<TestGenerationResponse>(
      `/modernization/tests/generate?repo=${encodeURIComponent(repoParam)}&write_to_disk=false`,
      { method: 'POST' }
    );
  }

  // AI Generation
  async generateCode(username: string | undefined, repo: string, targetLanguage: string): Promise<CodeGenerationResponse> {
    return this.makeRequest<CodeGenerationResponse>(
      `/generate/ask`,
      {
        method: 'POST',
        body: JSON.stringify({
          username: username || 'user', // Provide default username if empty
          repo: repo,
          prompt: `Generate modern ${targetLanguage} code equivalent for this repository. Focus on best practices, modern patterns, and improvements over the legacy code.`
        }),
      }
    );
  }

  // Streaming API for real-time updates
  async streamAnalysis(username: string | undefined, repo: string, onUpdate: (data: any) => void): Promise<void> {
    try {
      const response = await fetch(`${BACKEND_URL}/generate/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username || 'user', // Provide default username if empty
          repo: repo,
          prompt: `Analyze this repository and provide a comprehensive overview including architecture, key components, and modernization opportunities. Generate a detailed Mermaid flowchart showing the repository's system architecture with components like development environment, execution setup, examples, database management, and utilities. The diagram should be similar to a system design diagram showing how different parts of the repository interact and work together.`
        }),
      });

      if (!response.ok) {
        throw new Error(`Stream request failed: ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body reader available');
      }

      const decoder = new TextDecoder();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              console.log('Raw streaming data:', data);
              onUpdate(data);
            } catch (e) {
              // Skip malformed JSON
              console.warn('Failed to parse streaming data:', line, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming failed:', error);
      throw error;
    }
  }

  // Metrics and health
  async getMetrics(username: string | undefined, repo: string): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/graph/metrics?repo=${encodeURIComponent(repoParam)}`);
  }

  async getHealth(): Promise<any> {
    return this.makeRequest('/health');
  }

  async getReady(): Promise<any> {
    return this.makeRequest('/ready');
  }

  // Requirements API
  async getRequirements(_username: string | undefined, repo: string): Promise<RequirementsData> {
    return this.makeRequest<RequirementsData>(`/requirements/${encodeURIComponent(repo)}`);
  }

  async saveRequirements(_username: string | undefined, repo: string, requirements: RequirementsData): Promise<{ status: string; message: string }> {
    return this.makeRequest<{ status: string; message: string }>(
      `/requirements/${encodeURIComponent(repo)}`,
      {
        method: 'POST',
        body: JSON.stringify(requirements),
      }
    );
  }

  async exportRequirements(username: string | undefined, repo: string, format: 'json' | 'markdown' = 'json'): Promise<any> {
    const repoParam = this.formatRepoParam(username, repo);
    return this.makeRequest(`/requirements/${encodeURIComponent(repoParam)}/export?format=${format}`);
  }

  // Architecture API
  async getArchitectureRecommendations(_username: string | undefined, repo: string): Promise<ArchitectureRecommendation> {
    return this.makeRequest<ArchitectureRecommendation>(`/architecture/${encodeURIComponent(repo)}/recommendations`);
  }

  async saveArchitectureRecommendations(_username: string | undefined, repo: string, recommendations: ArchitectureRecommendation): Promise<{ status: string; message: string }> {
    return this.makeRequest<{ status: string; message: string }>(
      `/architecture/${encodeURIComponent(repo)}/recommendations`,
      {
        method: 'POST',
        body: JSON.stringify(recommendations),
      }
    );
  }

  async getArchitectureDiagram(_username: string | undefined, repo: string): Promise<ArchitectureDiagram> {
    return this.makeRequest<ArchitectureDiagram>(`/architecture/${encodeURIComponent(repo)}/diagram`);
  }

  async saveArchitectureDiagram(_username: string | undefined, repo: string, diagram: ArchitectureDiagram): Promise<{ status: string; message: string }> {
    return this.makeRequest<{ status: string; message: string }>(
      `/architecture/${encodeURIComponent(repo)}/diagram`,
      {
        method: 'POST',
        body: JSON.stringify(diagram),
      }
    );
  }

  // Code Generation APIs
  async generateCodeForService(serviceName: string): Promise<any> {
    // Remove spaces from service name for API call
    const cleanServiceName = serviceName.replace(/\s+/g, '');
    
    return this.makeRequest(`/codegen/generate/${encodeURIComponent(cleanServiceName)}`, {
      method: 'POST',
    });
  }

  async generateCodeForAllServices(): Promise<any> {
    return this.makeRequest('/codegen/generate-all', {
      method: 'POST',
    });
  }

  async getServiceStatus(serviceName: string): Promise<'Not Started' | 'In Progress' | 'Completed' | 'Failed'> {
    try {
      // Remove spaces from service name for API call
      const cleanServiceName = serviceName.replace(/\s+/g, '');
      
      const response = await this.makeRequest<{ 
        service_name: string; 
        status: string; 
        message: string 
      }>(`/codegen/status/${encodeURIComponent(cleanServiceName)}`);
      
      // Map the API response status to our expected format
      switch (response.status.toLowerCase()) {
        case 'completed':
          return 'Completed';
        case 'in progress':
        case 'inprogress':
          return 'In Progress';
        case 'failed':
        case 'error':
          return 'Failed';
        case 'not started':
        case 'notstarted':
        default:
          return 'Not Started';
      }
    } catch (error) {
      console.error(`Failed to get status for ${serviceName}:`, error);
      return 'Not Started';
    }
  }

  async getServiceStatusWithMessage(serviceName: string): Promise<{ 
    service_name: string; 
    status: string; 
    message: string 
  }> {
    // Remove spaces from service name for API call
    const cleanServiceName = serviceName.replace(/\s+/g, '');
    
    return this.makeRequest<{ 
      service_name: string; 
      status: string; 
      message: string 
    }>(`/codegen/status/${encodeURIComponent(cleanServiceName)}`);
  }

  async getAllServices(): Promise<{ services: Array<{ name: string; status: string; created: number }> }> {
    return this.makeRequest<{ services: Array<{ name: string; status: string; created: number }> }>('/codegen/services');
  }

  // Legacy Modernization Analysis APIs
  async startAnalysisRecommendation(repoPath: string, provider: string, model: string, projectName: string): Promise<{ job_id: string }> {
    return this.makeRequest<{ job_id: string }>('/analysis/analyze/start', {
      method: 'POST',
      body: JSON.stringify({
        repo_path: repoPath,
        provider: provider,
        model: model,
        project_name: projectName
      }),
    });
  }

  async getAnalysisStatus(jobId: string): Promise<{
    status: string;
    result_json?: {
      summary_json: {
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
      };
      report_md: string;
    };
    error?: string;
    mermaid_diagram?: string;
  }> {
    return this.makeRequest(`/analysis/analyze/status/${jobId}`);
  }

  // Authentication APIs
  async login(username: string, password: string): Promise<{ success: boolean; message: string; username: string; persona: string }> {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies in the request
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async getAuthStatus(): Promise<{ authenticated: boolean; username?: string; persona?: string }> {
    const response = await fetch(`${BACKEND_URL}/auth/status`, {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error(`Auth status check failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  async logout(): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${BACKEND_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });

    if (!response.ok) {
      throw new Error(`Logout failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  // Test Generation APIs
  async generateManualTests(serviceName: string): Promise<any> {
    return this.makeRequest(`/testgen/manual/${encodeURIComponent(serviceName)}`, {
      method: 'POST',
    });
  }

  async generateAutomatedTests(serviceName: string): Promise<any> {
    return this.makeRequest(`/testgen/automated/${encodeURIComponent(serviceName)}`, {
      method: 'POST',
    });
  }

  async getManualTestStatus(serviceName: string): Promise<'Not Started' | 'In Progress' | 'Completed' | 'Failed'> {
    const response = await this.makeRequest<{ status: string }>(`/testgen/manual/${encodeURIComponent(serviceName)}/status`);
    return response.status as 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
  }

  async getAutomatedTestStatus(serviceName: string): Promise<'Not Started' | 'In Progress' | 'Completed' | 'Failed'> {
    const response = await this.makeRequest<{ status: string }>(`/testgen/automated/${encodeURIComponent(serviceName)}/status`);
    return response.status as 'Not Started' | 'In Progress' | 'Completed' | 'Failed';
  }

  async getManualTests(serviceName: string): Promise<string> {
    const response = await this.makeRequest<{ content: string }>(`/testgen/manual/${encodeURIComponent(serviceName)}/content`);
    return response.content;
  }

  async updateManualTests(serviceName: string, content: string): Promise<any> {
    return this.makeRequest(`/testgen/manual/${encodeURIComponent(serviceName)}/content`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  }

  // Legacy methods for backward compatibility
  async getRepositoryNodes(repo: string): Promise<GraphNode[]> {
    const [username, repoName] = this.parseRepoString(repo);
    const response = await this.getNodes(username, repoName);
    return response.nodes || [];
  }

  async getRepositoryEdges(repo: string): Promise<GraphEdge[]> {
    const [username, repoName] = this.parseRepoString(repo);
    const response = await this.getEdges(username, repoName);
    return response.edges || [];
  }

  async getRepositoryView(repo: string, viewType: 'architecture' | 'module' | 'process'): Promise<GraphViewResponse> {
    const [username, repoName] = this.parseRepoString(repo);
    return this.getGraphView(username, repoName, viewType);
  }

  async getRepositoryProgress(repo: string): Promise<any> {
    const [username, repoName] = this.parseRepoString(repo);
    return this.getProgress(username, repoName);
  }

  private parseRepoString(repo: string): [string | undefined, string] {
    const parts = repo.split('/');
    if (parts.length === 2) {
      return [parts[0], parts[1]];
    }
    return [undefined, repo];
  }
}

export const apiService = new ApiService();
export default apiService; 