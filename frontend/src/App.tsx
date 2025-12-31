import { Toaster as SonnerToaster } from "sonner";
import { Toaster } from "@/shared/components/ui/toaster";
import { TooltipProvider } from "@/shared/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/shared/ui/dashboard.layout";
import Dashboard from "./pages/Dashboard";
import GroupFormation from "./pages/GroupFormation";
import Supervisors from "./pages/Supervisors";
import SupervisorFeed from "./pages/SupervisorFeed";
import Notifications from "./pages/Notifications";
import Collaboration from "./pages/Collaboration";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/login.page";
import { SignupPage } from "./pages/auth/signup.page";
import { authRoutes, studentRoutes, supervisorRoutes } from "./core/routes";
import SupervisorPosts from "./pages/SupervisorPosts";
import CreateSupervisorPost from "./pages/CreateSupervisorPost";
import SupervisorInvitations from "./pages/SupervisorInvitations";
import AdminNotifications from "./pages/AdminNotifications";
import ManageStudents from "./pages/admin/ManageStudents";
import ManageSupervisors from "./pages/admin/ManageSupervisors";
import AddStudent from "./pages/admin/AddStudent";
import EditStudent from "./pages/admin/EditStudent";
import AddSupervisor from "./pages/admin/AddSupervisor";
import EditSupervisor from "./pages/admin/EditSupervisor";
import { ForgotPasswordPage } from "./pages/auth/forgot-password.page";
import ProfileSetup from "./pages/ProfileSetup";
import ProtectedRoute from "@/shared/components/protected-route";
import { useAuthInit } from "@/shared/hooks/use-auth-init";
import PageSpinner from "./shared/components/ui/page-spinner";

const queryClient = new QueryClient();

const App = () => {
  // Initialize authentication
  const { isFetching } = useAuthInit();

  if (isFetching) {
    return <PageSpinner />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SonnerToaster />
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Auth routes - no protection needed */}
            <Route path={authRoutes.LOGIN_ROUTE} element={<LoginPage />} />
            <Route path={authRoutes.SIGNUP_ROUTE} element={<SignupPage />} />
            <Route
              path={authRoutes.FORGOT_PASSWORD_ROUTE}
              element={<ForgotPasswordPage />}
            />

            {/* Protected routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />

              {/* Profile setup - doesn't require profile completion */}
              <Route
                path="/profile-setup"
                element={
                  <ProtectedRoute requireProfileComplete={false}>
                    <ProfileSetup />
                  </ProtectedRoute>
                }
              />

              {/* Student-only routes */}
              <Route
                path={studentRoutes.CREATE_GROUP_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <GroupFormation />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <Supervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor-feed"
                element={
                  <ProtectedRoute allowedRoles={["student"]}>
                    <SupervisorFeed />
                  </ProtectedRoute>
                }
              />

              {/* Supervisor-only routes */}
              <Route
                path={supervisorRoutes.SUP_POSTS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorPosts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/supervisor/posts/create"
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <CreateSupervisorPost />
                  </ProtectedRoute>
                }
              />
              <Route
                path={supervisorRoutes.SUP_INVITATIONS_ROUTE}
                element={
                  <ProtectedRoute allowedRoles={["supervisor"]}>
                    <SupervisorInvitations />
                  </ProtectedRoute>
                }
              />

              {/* Admin-only routes */}
              <Route
                path="/admin/notifications"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminNotifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageStudents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/add"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddStudent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/students/edit/:studentId"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <EditStudent />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/supervisors"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ManageSupervisors />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/supervisors/add"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AddSupervisor />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/supervisors/edit/:supervisorId"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <EditSupervisor />
                  </ProtectedRoute>
                }
              />

              {/* Common routes for all authenticated users */}
              <Route
                path={studentRoutes.NOTIFICATIONS_ROUTE}
                element={<Notifications />}
              />
              <Route path="/collaboration" element={<Collaboration />} />

              {/* Resource pages */}
              <Route
                path="/guidelines"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">FYP Guidelines</h1>
                    <p className="text-muted-foreground">
                      Project guidelines and requirements will be displayed
                      here...
                    </p>
                  </div>
                }
              />
              <Route
                path="/students"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Find Students</h1>
                    <p className="text-muted-foreground">
                      Student discovery and networking features coming soon...
                    </p>
                  </div>
                }
              />
              <Route
                path="/research"
                element={
                  <div className="p-6">
                    <h1 className="text-2xl font-bold">Research Areas</h1>
                    <p className="text-muted-foreground">
                      Research area directory and exploration coming soon...
                    </p>
                  </div>
                }
              />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
