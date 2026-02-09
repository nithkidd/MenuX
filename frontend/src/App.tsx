
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './features/auth/auth.context';
import Login from './features/auth/pages/Login';
import Dashboard from './features/business/pages/Dashboard';
import CreateBusiness from './features/business/pages/CreateBusiness';
import MenuEditor from './features/menu/pages/MenuEditor';
import PublicMenu from './features/menu/pages/PublicMenu';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route
        path="/dashboard/create-business"
        element={
          <ProtectedRoute>
            <CreateBusiness />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/business/:businessId"
        element={
          <ProtectedRoute>
            <MenuEditor />
          </ProtectedRoute>
        }
      />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
