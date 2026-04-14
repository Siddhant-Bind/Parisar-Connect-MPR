import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Home,
  Bell,
  Users,
  Shield,
  Settings,
  LogOut,
  Menu,
  ChevronRight,
  Building2,
  MessageSquare,
  Clock,
  CreditCard,
  Check,
} from "lucide-react";
import { ModeToggle } from "@/components/mode-toggle";
import logo from "@/assets/logo.png";
import { NotificationBell } from "./NotificationBell";
import { useAuth } from "@/context/AuthProvider";

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: "resident" | "admin" | "guard";
  userName?: string;
}

const roleConfig = {
  resident: {
    title: "Resident",
    navItems: [
      { label: "Home", icon: Home, path: "/dashboard/resident" },
      {
        label: "Notices",
        icon: Bell,
        path: "/dashboard/resident/notices",
      },
      {
        label: "Payments",
        icon: CreditCard,
        path: "/dashboard/resident/payments",
      },
      {
        label: "Complaints",
        icon: MessageSquare,
        path: "/dashboard/resident/complaints",
      },
      { label: "Visitors", icon: Users, path: "/dashboard/resident/visitors" },
    ],
    accentColor: "bg-soft-peach",
  },
  admin: {
    title: "Admin",
    navItems: [
      { label: "Dashboard", icon: Home, path: "/dashboard/admin" },
      { label: "Reports", icon: Building2, path: "/dashboard/admin/reports" },
      { label: "Residents", icon: Users, path: "/dashboard/admin/residents" },
      { label: "Guards", icon: Shield, path: "/dashboard/admin/guards" },
      { label: "Approvals", icon: Shield, path: "/dashboard/admin/approvals" },
      {
        label: "Notices", // Changed from Announcements to match page title usually
        icon: Bell,
        path: "/dashboard/admin/notices", // Updated path to match App.tsx
      },
      {
        label: "Complaints",
        icon: MessageSquare,
        path: "/dashboard/admin/complaints",
      },
      { label: "Visitors", icon: Clock, path: "/dashboard/admin/visitors" },
      {
        label: "Payments",
        icon: CreditCard,
        path: "/dashboard/admin/payments",
      },
    ],
    accentColor: "bg-mint-green",
  },
  guard: {
    title: "Security",
    navItems: [
      { label: "Dashboard", icon: Home, path: "/dashboard/guard" },
      {
        label: "Add Visitor",
        icon: Users,
        path: "/dashboard/guard/add-visitor",
      },
      {
        label: "Pre-approved",
        icon: Check,
        path: "/dashboard/guard/pre-approved",
      },
      {
        label: "Today's Log",
        icon: Clock,
        path: "/dashboard/guard/todays-log",
      },
      { label: "History", icon: LogOut, path: "/dashboard/guard/history" }, // Using LogOut icon for History for now as 'History' icon was used in dashboard page, checking imports...
      // Wait, let's use History icon if available or just Clock?
      // I'll stick to icons I can import easily. Check imports below.
    ],
    accentColor: "bg-light-yellow",
  },
};

const DashboardLayout = ({
  children,
  role,
  userName = "Demo User",
}: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const config = roleConfig[role];

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center">
            <img
              src={logo}
              alt="Parisar Connect"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <p className="font-bold text-foreground">Parisar Connect</p>
            <p className="text-xs text-muted-foreground">
              {config.title} Portal
            </p>
          </div>
        </Link>
      </div>

      {/* User Info */}
      <div className="p-4">
        <div className={`${config.accentColor} rounded-2xl p-4`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-card flex items-center justify-center">
              <span className="font-bold text-primary">
                {userName.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">
                {userName}
              </p>
              <p className="text-xs text-muted-foreground">{config.title}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {config.navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-3 px-2">
          <p className="text-xs text-muted-foreground">Appearance</p>
          <ModeToggle />
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-destructive rounded-xl"
          onClick={async () => {
            await logout();
            navigate("/login");
          }}
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64 lg:flex-col bg-card border-r border-border">
        <NavContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center">
              <img
                src={logo}
                alt="Parisar Connect"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-bold text-foreground">Parisar Connect</span>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-xl">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0 bg-card">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64 pt-16 lg:pt-0 min-h-screen">
        <div className="hidden lg:flex items-center justify-end p-4 lg:px-8 pb-0">
          <NotificationBell />
        </div>
        <div className="p-4 pb-24 lg:p-8 lg:pt-4 lg:pb-8">{children}</div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border px-1 py-1.5 z-50">
        <div className="flex items-center justify-around">
          {config.navItems.slice(0, 4).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-4 h-4" />
                <span className="text-[10px] font-medium truncate max-w-[60px]">{item.label}</span>
              </Link>
            );
          })}
          {config.navItems.length > 4 && (
            <button
              onClick={() => setIsOpen(true)}
              className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-colors min-w-0 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-4 h-4" />
              <span className="text-[10px] font-medium truncate max-w-[60px]">Menu</span>
            </button>
          )}
        </div>
      </nav>
    </div>
  );
};

export default DashboardLayout;
