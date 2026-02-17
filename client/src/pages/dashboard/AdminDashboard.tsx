import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  Shield,
  Bell,
  CreditCard,
  TrendingUp,
  ChevronRight,
  Plus,
  Building2,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalResidents: 0,
    openComplaints: 0,
    pendingPayments: 0,
    collectionRate: 0,
    visitorsToday: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/admin/dashboard");
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
        toast.error("Failed to load dashboard stats");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Residents",
      value: stats.totalResidents.toString(),
      icon: Users,
      trend: "+4% from last month",
      color: "bg-soft-peach", // Light orange for residents
    },
    {
      title: "Open Complaints",
      value: stats.openComplaints.toString(),
      icon: Bell,
      trend: "3 urgent",
      color: "bg-mint-green", // Soft green for status
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      icon: CreditCard,
      trend: `${stats.collectionRate}% collected`,
      color: "bg-light-yellow", // Warning yellow
    },
    {
      title: "Visitors Today",
      value: stats.visitorsToday.toString(),
      icon: Shield,
      trend: "Active now",
      color: "bg-lavender-mist", // Soft purple
    },
  ];

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              Society Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Sunshine Residency
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => navigate("/dashboard/admin/notices")}
            >
              <Bell className="w-4 h-4 mr-2" />
              Manage Notices
            </Button>
            <Button className="rounded-xl bg-gradient-warm text-primary-foreground shadow-button btn-press">
              <Plus className="w-4 h-4 mr-2" />
              Add Resident
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
            {statCards.map((stat, index) => (
              <Card
                key={index}
                className="border-0 shadow-soft hover:shadow-elevated transition-shadow duration-300 rounded-2xl overflow-hidden"
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-card/50">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${stat.color}`}>
                    <stat.icon className="h-4 w-4 text-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    {index === 2 ? (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    ) : (
                      <Clock className="w-3 h-3" />
                    )}
                    {stat.trend}
                  </p>
                  {/* This button was incorrectly placed and caused the JSX error */}
                  {/* <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 rounded-lg h-8"
                      >
                        Decline
                      </Button> */}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pending Approvals */}
        <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Clock className="w-5 h-5 text-warm-orange" />
              Pending Approvals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground p-4 text-center">
                No pending approvals.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Add Resident",
                  icon: Users,
                  color: "bg-soft-peach",
                  path: "/dashboard/admin/residents",
                },
                {
                  label: "Add Guard",
                  icon: Shield,
                  color: "bg-mint-green",
                  path: "/dashboard/admin/guards",
                },
                {
                  label: "Send Notice",
                  icon: Bell,
                  color: "bg-light-yellow",
                  path: "/dashboard/admin/announcements",
                },
                {
                  label: "View Reports",
                  icon: TrendingUp,
                  color: "bg-soft-peach/60",
                  path: "/dashboard/admin/reports",
                },
              ].map((action) => (
                <button
                  key={action.label}
                  className={`${action.color} p-4 rounded-xl flex flex-col items-center gap-2 hover:opacity-80 transition-opacity card-hover`}
                  onClick={() => action.path && navigate(action.path)}
                >
                  <action.icon className="w-6 h-6 text-foreground" />
                  <span className="text-sm font-medium text-foreground">
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
