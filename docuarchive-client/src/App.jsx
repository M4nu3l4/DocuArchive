import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import DocumentsPage from "./pages/DocumentsPage";
import ClientsPage from "./pages/ClientsPage";
import CategoriesPage from "./pages/CategoriesPage";
import WorkflowStatusesPage from "./pages/WorkflowStatusesPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import UsersPage from "./pages/UsersPage";
import AssignedDocumentsPage from "./pages/AssignedDocumentsPage";
import MyLogsPage from "./pages/MyLogsPage";
import SystemLogsPage from "./pages/SystemLogsPage";
import DashboardPage from "./pages/DashboardPage";

function ProtectedLayout({ children }) {
  const { authenticated, authLoading } = useAuth();

  if (authLoading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function App() {
  return (
    <AppSettingsProvider>
      <AuthProvider>
        <BrowserRouter>
          <ToastContainer position="top-right" autoClose={2500} />

          <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route
              path="*"
              element={
                <ProtectedLayout>
                  <Routes>
                    <Route path="/" element={<Navigate to="/documents" />} />
                    <Route path="/dashboard" element={<DashboardPage />} />

                    <Route path="/documents" element={<DocumentsPage />} />

                    <Route path="/clients" element={<ClientsPage />} />

                    <Route path="/categories" element={<CategoriesPage />} />

                    <Route
                      path="/workflow-statuses"
                      element={<WorkflowStatusesPage />}
                    />

                    <Route path="/profile" element={<ProfilePage />} />

                    <Route path="/settings" element={<SettingsPage />} />

                    <Route path="/users" element={<UsersPage />} />
                    <Route
                      path="/assigned-documents"
                      element={<AssignedDocumentsPage />}
                    />
                    <Route path="/my-logs" element={<MyLogsPage />} />
                    <Route path="/system-logs" element={<SystemLogsPage />} />
                  </Routes>
                </ProtectedLayout>
              }
            />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AppSettingsProvider>
  );
}

export default App;
