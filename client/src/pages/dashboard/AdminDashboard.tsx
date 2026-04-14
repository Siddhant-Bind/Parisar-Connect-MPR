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
  Plus,
  Building2,
  Clock,
  Loader2,
  Activity
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDashboardStats, useRecentActivity } from "@/hooks/useQueries";
import { useAuth } from "@/context/AuthProvider";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: fetchedStats, isLoading: loading } = useDashboardStats();
  const { data: recentActivity, isLoading: loadingActivity } = useRecentActivity();
  const stats = fetchedStats || {
    totalResidents: 0,
    openComplaints: 0,
    pendingPayments: 0,
    collectionRate: 0,
    visitorsToday: 0,
    currentVisitors: 0,
    pendingApprovals: 0,
  };

  const statCards = [
    {
      title: "Total Residents",
      value: stats.totalResidents.toString(),
      icon: Users,
      trend: `${stats.currentVisitors} visitors active`,
      color: "bg-soft-peach",
      path: "/dashboard/admin/residents",
    },
    {
      title: "Open Complaints",
      value: stats.openComplaints.toString(),
      icon: Bell,
      trend: `${stats.pendingApprovals} pending approvals`,
      color: "bg-mint-green",
      path: "/dashboard/admin/complaints",
    },
    {
      title: "Pending Payments",
      value: stats.pendingPayments.toString(),
      icon: CreditCard,
      trend: `${stats.collectionRate}% collected`,
      color: "bg-light-yellow",
      path: "/dashboard/admin/payments",
    },
    {
      title: "Visitors Today",
      value: stats.visitorsToday.toString(),
      icon: Shield,
      trend: `${stats.currentVisitors} currently inside`,
      color: "bg-lavender-mist",
      path: "/dashboard/admin/visitors",
    },
  ];

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-up">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
              Society Dashboard
            </h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              {stats.societyName || user.society?.name || "Your Society"}
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
            <Button
              className="rounded-xl bg-gradient-warm text-primary-foreground shadow-button btn-press"
              onClick={() => navigate("/dashboard/admin/residents")}
            >
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
                onClick={() => navigate(stat.path)}
                className="border-0 shadow-soft hover:shadow-elevated transition-shadow duration-300 rounded-2xl overflow-hidden cursor-pointer"
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
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Activity */}
        <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-3">
          <CardHeader className="pb-3 border-b border-border/40">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {loadingActivity ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : !recentActivity || recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                No recent activity across the society.
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((activity: { id: string, type: string, title: string, description: string, timestamp: string, icon: string }) => {
                  const Icon = activity.icon === 'Shield' ? Shield : activity.icon === 'Bell' ? Bell : CreditCard;
                  const iconColor = activity.icon === 'Shield' ? "text-emerald-500 bg-emerald-50" : activity.icon === 'Bell' ? "text-orange-500 bg-orange-50" : "text-blue-500 bg-blue-50";
                  
                  return (
                    <div key={activity.id} className="flex items-start gap-4 pb-4 last:pb-0 last:border-0 border-b border-border/40">
                      <div className={`p-2 rounded-full ${iconColor}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.description}</p>
                      </div>
                      <div className="text-xs font-medium text-muted-foreground whitespace-nowrap">
                        {new Date(activity.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
                  path: "/dashboard/admin/notices",
                },
                {
                  label: "View Payments",
                  icon: CreditCard,
                  color: "bg-soft-peach/60",
                  path: "/dashboard/admin/payments",
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
