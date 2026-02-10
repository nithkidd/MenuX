import React, { Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./features/auth/auth.context";
import { ThemeProvider } from "./shared/contexts/ThemeContext";
import { usePermissions } from "./shared/hooks/usePermissions";
import AdminDashboard from "./features/admin/pages/AdminDashboard";
import Login from "./features/auth/pages/Login";
import Dashboard from "./features/business/pages/Dashboard";
import CreateBusiness from "./features/business/pages/CreateBusiness";
import MenuEditor from "./features/menu/pages/MenuEditor";
import PublicMenu from "./features/menu/pages/PublicMenu";
import BusinessSettings from "./features/business/pages/BusinessSettings";
import UserSettings from "./features/auth/pages/UserSettings";
import BusinessLayout from "./features/business/components/BusinessLayout";
import BusinessOverview from "./features/business/pages/BusinessOverview";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}



/**
 * Admin-only route protection.
 * Redirects non-admin users to dashboard.
 */
function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const { can } = usePermissions();

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!can("read", "admin_dashboard")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

// Simple Error Boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold text-red-600">
            Something went wrong.
          </h2>
          <p className="mt-2 text-gray-600">Please refresh the page.</p>
          <pre className="mt-4 p-4 bg-gray-100 rounded text-left overflow-auto text-sm">
            {this.state.error?.toString()}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}

import MainLayout from "./shared/components/MainLayout";

const LandingPage = React.lazy(() => import("./features/landing/pages/LandingPage"));

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-white">
            <div className="border-b border-stone-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-stone-200 rounded-lg animate-pulse" />
                        <div className="h-6 w-24 bg-stone-200 rounded animate-pulse" />
                    </div>
                    <div className="hidden md:flex items-center gap-8">
                        <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
                        <div className="h-4 w-16 bg-stone-200 rounded animate-pulse" />
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-24 bg-stone-200 rounded-xl animate-pulse" />
                        <div className="h-10 w-24 bg-stone-200 rounded-xl animate-pulse" />
                    </div>
                </div>
            </div>
            <div className="pt-16 pb-16 md:pt-32 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="h-16 w-3/4 mx-auto bg-stone-200 rounded-2xl animate-pulse mb-8" />
                <div className="h-4 w-1/2 mx-auto bg-stone-100 rounded animate-pulse mb-4" />
                <div className="h-4 w-2/3 mx-auto bg-stone-100 rounded animate-pulse mb-10" />
                <div className="flex justify-center gap-4">
                    <div className="h-14 w-40 bg-stone-200 rounded-2xl animate-pulse" />
                    <div className="h-14 w-40 bg-stone-200 rounded-2xl animate-pulse" />
                </div>
            </div>
          </div>
        }
      >
        <Routes>
          {/* Public Menu Route - No Layout */}
          <Route path="/menu/:slug" element={<PublicMenu />} />

          {/* Main App Layout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route
                path="/settings"
                element={
                    <ProtectedRoute>
                        <UserSettings />
                    </ProtectedRoute>
                }
            />
            <Route
                path="/admin"
                element={
                <AdminRoute>
                    <AdminDashboard />
                </AdminRoute>
                }
            />
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
                        <BusinessLayout />
                    </ProtectedRoute>
                    }
                >
                    <Route index element={<Navigate to="overview" replace />} />
                    <Route path="overview" element={<BusinessOverview />} />
                    <Route path="menu" element={<MenuEditor />} />
                    <Route path="settings" element={<BusinessSettings />} />
                </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
          <AppRoutes />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
