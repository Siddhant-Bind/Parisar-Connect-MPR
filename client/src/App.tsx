import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ResidentDashboard from "./pages/dashboard/ResidentDashboard";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
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
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/dashboard/resident" element={<ResidentDashboard />} />
            <Route
              path="/dashboard/resident/payments"
              element={<ResidentPayments />}
            />
            <Route
              path="/dashboard/resident/notices"
              element={<ResidentNotices />}
            />
            <Route
              path="/dashboard/resident/complaints"
              element={<ResidentComplaints />}
            />
            <Route
              path="/dashboard/resident/visitors"
              element={<ResidentVisitors />}
            />
            <Route path="/dashboard/admin" element={<AdminDashboard />} />
            <Route path="/dashboard/admin/residents" element={<Residents />} />
            <Route path="/dashboard/admin/guards" element={<Guards />} />
            <Route path="/dashboard/admin/notices" element={<Notices />} />
            <Route
              path="/dashboard/admin/complaints"
              element={<Complaints />}
            />
            <Route path="/dashboard/admin/visitors" element={<Visitors />} />
            <Route path="/dashboard/admin/payments" element={<Payments />} />
            <Route path="/dashboard/guard" element={<GuardDashboard />} />
            <Route
              path="/dashboard/guard/visitors"
              element={<GuardVisitors />}
            />
            <Route
              path="/dashboard/guard/add-visitor"
              element={<AddVisitorPage />}
            />
            <Route
              path="/dashboard/guard/pre-approved"
              element={<PreApprovedVisitors />}
            />
            <Route path="/dashboard/guard/todays-log" element={<TodaysLog />} />
            <Route
              path="/dashboard/guard/history"
              element={<VisitorHistory />}
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
