import React, { useState } from 'react';
import { TestTube, Play, CheckCircle, XCircle, Database, Server, Monitor, Code, Zap } from 'lucide-react';

interface TestCase {
  id: string;
  given: string;
  when: string;
  then: string;
  status: 'pending' | 'accepted' | 'denied';
  automated: boolean;
}

interface Component {
  id: string;
  name: string;
  type: 'service' | 'database' | 'api' | 'ui';
  testCases: TestCase[];
  testStatus: 'not_started' | 'in_progress' | 'completed';
}

const Testing: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);
  const [generatingTests, setGeneratingTests] = useState(false);
  const [generatingAutomatedTests, setGeneratingAutomatedTests] = useState(false);

  // Single service - User Service with not started status
  const userService: Component = {
    id: '1',
    name: 'User Service',
    type: 'service',
    testStatus: 'not_started',
    testCases: []
  };

  const handleComponentSelect = (component: Component) => {
    setSelectedComponent(component);
  };

  const handleGenerateTests = async (component: Component) => {
    setGeneratingTests(true);
    
    // Simulate test generation
    setTimeout(() => {
      const newTestCases: TestCase[] = [
        {
          id: Date.now().toString(),
          given: 'A valid user session exists',
          when: 'The user requests component functionality',
          then: 'The component should respond with expected behavior',
          status: 'pending',
          automated: false
        },
        {
          id: (Date.now() + 1).toString(),
          given: 'Invalid input data is provided',
          when: 'The component processes the request',
          then: 'The component should return appropriate error messages',
          status: 'pending',
          automated: false
        },
        {
          id: (Date.now() + 2).toString(),
          given: 'The system is under high load',
          when: 'Multiple requests are made simultaneously',
          then: 'The component should maintain performance within acceptable limits',
          status: 'pending',
          automated: false
        }
      ];

      // Update component with new test cases
      const updatedComponent = {
        ...component,
        testCases: [...component.testCases, ...newTestCases],
        testStatus: 'in_progress' as const
      };
      setSelectedComponent(updatedComponent);
      
      setGeneratingTests(false);
    }, 3000);
  };

  const handleTestStatusChange = (testCaseId: string, newStatus: 'accepted' | 'denied') => {
    if (selectedComponent) {
      const updatedComponent = {
        ...selectedComponent,
        testCases: selectedComponent.testCases.map(test =>
          test.id === testCaseId ? { ...test, status: newStatus } : test
        )
      };
      
      setSelectedComponent(updatedComponent);
    }
  };

  const handleGenerateAutomatedTests = async (component: Component) => {
    setGeneratingAutomatedTests(true);
    
    // Simulate automated test generation
    setTimeout(() => {
      if (selectedComponent) {
        const updatedComponent = {
          ...selectedComponent,
          testCases: selectedComponent.testCases.map(test =>
            test.status === 'accepted' ? { ...test, automated: true } : test
          )
        };
        
        setSelectedComponent(updatedComponent);
      }
      
      setGeneratingAutomatedTests(false);
    }, 2000);
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

  const getTestStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in_progress': return <Play className="w-4 h-4" />;
      default: return <TestTube className="w-4 h-4" />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Left Side - Service List */}
      <div className="w-1/3 flex flex-col border-r border-gray-200">
        <div className="bg-white border-b border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900">Services</h2>
          <p className="text-sm text-gray-600">Select a service to view testing status</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div
            onClick={() => handleComponentSelect(userService)}
            className={`p-4 border-b border-gray-200 cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedComponent?.id === userService.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                {getComponentIcon(userService.type)}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 text-sm">{userService.name}</h3>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTestStatusColor(userService.testStatus)}`}>
                    {getTestStatusIcon(userService.testStatus)}
                    <span className="ml-1">{userService.testStatus.replace('_', ' ')}</span>
                  </span>
                  <span className="text-xs text-gray-500">
                    {userService.testCases.filter(t => t.status === 'accepted').length}/{userService.testCases.length} tests
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Test Cases */}
      <div className="w-2/3 flex flex-col">
        {selectedComponent ? (
          <>
            {/* Component Header */}
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    {getComponentIcon(selectedComponent.type)}
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{selectedComponent.name}</h2>
                    <p className="text-sm text-gray-600">Testing Status: {selectedComponent.testStatus.replace('_', ' ')}</p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleGenerateTests(selectedComponent)}
                    disabled={generatingTests}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {generatingTests ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <TestTube className="w-4 h-4 mr-2" />
                        Generate Tests
                      </>
                    )}
                  </button>
                  
                  {selectedComponent.testCases.some(t => t.status === 'accepted' && !t.automated) && (
                    <button
                      onClick={() => handleGenerateAutomatedTests(selectedComponent)}
                      disabled={generatingAutomatedTests}
                      className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {generatingAutomatedTests ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Generate Automated Tests
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Test Cases */}
            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Test Cases</h3>
              
              {selectedComponent.testCases.length === 0 ? (
                <div className="text-center py-8">
                  <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600">No test cases yet. Click "Generate Tests" to create test cases.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedComponent.testCases.map((testCase) => (
                    <div key={testCase.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <span className="text-sm font-medium text-gray-900">Given:</span>
                          <p className="text-sm text-gray-700 mt-1">{testCase.given}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">When:</span>
                          <p className="text-sm text-gray-700 mt-1">{testCase.when}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">Then:</span>
                          <p className="text-sm text-gray-700 mt-1">{testCase.then}</p>
                        </div>
                        
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              testCase.status === 'accepted' ? 'bg-green-100 text-green-800' :
                              testCase.status === 'denied' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {testCase.status === 'accepted' && <CheckCircle className="w-3 h-3 mr-1" />}
                              {testCase.status === 'denied' && <XCircle className="w-3 h-3 mr-1" />}
                              {testCase.status}
                            </span>
                            
                            {testCase.automated && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                <Zap className="w-3 h-3 mr-1" />
                                Automated
                              </span>
                            )}
                          </div>
                          
                          {testCase.status === 'pending' && (
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleTestStatusChange(testCase.id, 'accepted')}
                                className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded hover:bg-green-200 transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleTestStatusChange(testCase.id, 'denied')}
                                className="px-3 py-1 bg-red-100 text-red-700 text-xs font-medium rounded hover:bg-red-200 transition-colors"
                              >
                                Deny
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <TestTube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Component</h3>
              <p className="text-gray-600">Choose a component from the middle panel to view and manage test cases.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Testing; 