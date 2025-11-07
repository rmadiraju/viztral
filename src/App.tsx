import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProductIdea from './components/ProductIdea';
import ArchitectureDesign from './components/ArchitectureDesign';
import Development from './components/Development';
import Deployment from './components/Deployment';
import Testing from './components/Testing';
import Production from './components/Production';
import ProjectDetail from './components/ProjectDetail';
import Layout from './components/Layout';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import './App.css';

// Protected Route Component with RBAC
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredFeature: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredFeature }) => {
  const { isAuthenticated, hasPermission } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  if (!hasPermission(requiredFeature)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access this feature.</p>
          <button 
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/project/:projectId" element={<ProjectDetail />} />
        <Route path="/product-idea" element={
          <ProtectedRoute requiredFeature="product_idea">
            <ProductIdea />
          </ProtectedRoute>
        } />
        <Route path="/architecture-design" element={
          <ProtectedRoute requiredFeature="architecture_design">
            <ArchitectureDesign />
          </ProtectedRoute>
        } />
        <Route path="/development" element={
          <ProtectedRoute requiredFeature="development">
            <Development />
          </ProtectedRoute>
        } />
        <Route path="/deployment" element={
          <ProtectedRoute requiredFeature="deployment">
            <Deployment />
          </ProtectedRoute>
        } />
        <Route path="/testing" element={
          <ProtectedRoute requiredFeature="testing">
            <Testing />
          </ProtectedRoute>
        } />
        <Route path="/production" element={
          <ProtectedRoute requiredFeature="production">
            <Production />
          </ProtectedRoute>
        } />
      </Routes>
    </Layout>
  );
}

export default App;
