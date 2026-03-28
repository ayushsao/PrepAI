import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import { Loader2 } from 'lucide-react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { CustomCursor } from './components/ui/custom-cursor';

const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const InterviewSession = React.lazy(() => import('./pages/InterviewSession'));
const CodingLab = React.lazy(() => import('./pages/CodingLab'));
const Auth = React.lazy(() => import('./pages/Auth'));
const Analytics = React.lazy(() => import('./pages/Analytics'));
const Feedback = React.lazy(() => import('./pages/Feedback'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Pricing = React.lazy(() => import('./pages/Pricing'));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-[#08090b]">
    <div className="relative">
      <div className="w-12 h-12 rounded-full border-t-2 border-brand-cyan animate-spin" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Loader2 className="w-4 h-4 text-brand-cyan/40" />
      </div>
    </div>
  </div>
);

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth" />;
  
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CustomCursor />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/pricing" element={<Pricing />} />
            
            <Route path="/" element={<MainLayout />}>
              <Route index element={<LandingPage />} />
              <Route 
                path="dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="interview" 
                element={
                  <ProtectedRoute>
                    <InterviewSession />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="analytics" 
                element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="feedback" 
                element={
                  <ProtectedRoute>
                    <Feedback />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
            </Route>
            
            <Route 
              path="/coding-lab" 
              element={
                <ProtectedRoute>
                  <CodingLab />
                </ProtectedRoute>
              } 
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
