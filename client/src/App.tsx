import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ChangePassword from "./pages/ChangePassword";
import CreateSociety from "./pages/CreateSociety";
import JoinSociety from "./pages/JoinSociety";
import ResidentDashboard from "./pages/dashboard/ResidentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminApprovals from "./pages/dashboard/AdminApprovals";
import Reports from "./pages/dashboard/Reports";
import GuardDashboard from "./pages/dashboard/guard/GuardDashboard";
import GuardVisitors from "./pages/dashboard/guard/GuardVisitors";
import AddVisitorPage from "./pages/dashboard/guard/AddVisitorPage";
import PreApprovedVisitors from "./pages/dashboard/guard/PreApprovedVisitors";
import TodaysLog from "./pages/dashboard/guard/TodaysLog";
import VisitorHistory from "./pages/dashboard/guard/VisitorHistory";
import NotFound from "./pages/NotFound";
import Notices from "./pages/dashboard/Notices";
import Complaints from "./pages/dashboard/Complaints";
import Visitors from "./pages/dashboard/Visitors";
import Payments from "./pages/dashboard/Payments";
import Residents from "./pages/dashboard/Residents";
import Guards from "./pages/dashboard/Guards";
import ResidentPayments from "./pages/dashboard/resident/ResidentPayments";
import ResidentNotices from "./pages/dashboard/resident/ResidentNotices";
import ResidentComplaints from "./pages/dashboard/resident/ResidentComplaints";
import ResidentVisitors from "./pages/dashboard/resident/ResidentVisitors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider
      defaultTheme="system"
      storageKey="vite-ui-theme"
      attribute="class"
    >
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/change-password" element={<ChangePassword />} />

            {/* Protected: Society Setup (Admin only) */}
            <Route
              path="/create-society"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <CreateSociety />
                </ProtectedRoute>
              }
            />
            <Route
              path="/join-society"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <JoinSociety />
                </ProtectedRoute>
              }
            />

            {/* Protected: Resident Dashboard */}
            <Route
              path="/dashboard/resident"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resident/payments"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentPayments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resident/notices"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentNotices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resident/complaints"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/resident/visitors"
              element={
                <ProtectedRoute allowedRoles={["RESIDENT"]}>
                  <ResidentVisitors />
                </ProtectedRoute>
              }
            />

            {/* Protected: Admin Dashboard */}
            <Route
              path="/dashboard/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/residents"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Residents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/approvals"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminApprovals />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/reports"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Reports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/guards"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Guards />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/notices"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Notices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Complaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/visitors"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Visitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/admin/payments"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <Payments />
                </ProtectedRoute>
              }
            />

            {/* Protected: Guard Dashboard */}
            <Route
              path="/dashboard/guard"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <GuardDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guard/visitors"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <GuardVisitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guard/add-visitor"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <AddVisitorPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guard/pre-approved"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <PreApprovedVisitors />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guard/todays-log"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <TodaysLog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/guard/history"
              element={
                <ProtectedRoute allowedRoles={["GUARD"]}>
                  <VisitorHistory />
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
