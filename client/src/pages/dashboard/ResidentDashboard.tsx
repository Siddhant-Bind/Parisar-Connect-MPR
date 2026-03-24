import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Bell,
  Users,
  CreditCard,
  Calendar,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Notice, Visitor } from "@/types";
import { useNotices, useVisitors, usePayments } from "@/hooks/useQueries";
import { safeParseJSON } from "@/lib/utils";

const ResidentDashboard = () => {
  const [stats, setStats] = useState({
    noticesCount: 0,
    visitorsToday: 0,
    dueAmount: 0,
    eventsCount: 0,
  });
  const [announcements, setAnnouncements] = useState<Notice[]>([]);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);
  const navigate = useNavigate();

  const { data: noticesResp, isLoading: load1 } = useNotices(1, 10);
  const { data: visitorsResp, isLoading: load2 } = useVisitors(1, 10);
  const { data: paymentsResp, isLoading: load3 } = usePayments(1, 100);

  const loading = load1 || load2 || load3;

  useEffect(() => {
    if (loading) return;

    if (noticesResp?.data) {
      setStats((prev) => ({ ...prev, noticesCount: noticesResp.data.length }));
      setAnnouncements(noticesResp.data.slice(0, 3));
    }

    if (visitorsResp?.data) {
      const today = new Date().toDateString();
      const todayVisitors = visitorsResp.data.filter(
        (v: any) => new Date(v.entryTime).toDateString() === today,
      );
      setStats((prev) => ({
        ...prev,
        visitorsToday: todayVisitors.length,
      }));
      setVisitors(visitorsResp.data.slice(0, 3));
    }

    if (paymentsResp?.data) {
      const pending = paymentsResp.data.filter(
        (p: any) => p.status === "PENDING",
      );
      const totalDue = pending.reduce(
        (sum: number, p: any) => sum + p.amount,
        0,
      );
      setStats((prev) => ({ ...prev, dueAmount: totalDue }));
    }
  }, [loading, noticesResp, visitorsResp, paymentsResp]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <DashboardLayout role="resident" userName={user.name || "Resident"}>
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Welcome Section */}
        <div className="animate-fade-in-up">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Welcome back, {user.name?.split(" ")[0]} 👋
          </h1>
          <p className="text-muted-foreground">
            Here's what's happening in {user.society?.name || "your society"}{" "}
            today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-delay-1">
          <Card className="rounded-2xl border-0 shadow-card bg-soft-peach/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.noticesCount}
                  </p>
                  <p className="text-xs text-muted-foreground">New Notices</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-card bg-mint-green/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Users className="w-5 h-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.visitorsToday}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Visitors Today
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-card bg-light-yellow/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-warm-orange/20 flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-warm-orange" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{stats.dueAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">Due Amount</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-card bg-soft-peach/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-deep-navy/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-deep-navy" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {stats.eventsCount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Upcoming Events
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Announcements */}
          <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Bell className="w-5 h-5 text-primary" />
                  Announcements
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary rounded-lg"
                  onClick={() => navigate("/dashboard/resident/notices")}
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {announcements.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        item.priority === "HIGH"
                          ? "bg-destructive"
                          : "bg-secondary"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {item.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {item.priority === "HIGH" && (
                    <Badge variant="destructive" className="rounded-lg text-xs">
                      Urgent
                    </Badge>
                  )}
                </div>
              ))}
              {announcements.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No announcements.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Recent Visitors */}
          <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-3">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <Users className="w-5 h-5 text-secondary" />
                  Recent Visitors
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary rounded-lg"
                  onClick={() => navigate("/dashboard/resident/visitors")}
                >
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {visitors.map((visitor) => (
                <div
                  key={visitor.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <span className="font-bold text-secondary text-sm">
                        {visitor.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        {visitor.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {visitor.purpose}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(visitor.entryTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    {visitor.status === "EXITED" && (
                      <CheckCircle2 className="w-4 h-4 text-secondary ml-auto mt-1" />
                    )}
                    {visitor.status === "ENTERED" && (
                      <Badge className="bg-secondary text-xs mt-1">
                        Active
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
              {visitors.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">
                  No recent visitors.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Maintenance Status */}
        <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-warm-orange" />
              Maintenance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.dueAmount > 0 ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-light-yellow/30">
                <div>
                  <p className="text-sm text-muted-foreground">Total Dues</p>
                  <p className="text-2xl font-bold text-foreground">
                    ₹{stats.dueAmount}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Please pay as soon as possible
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-warm-orange/20 text-warm-orange border-0 rounded-lg">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Pending
                  </Badge>
                  <Button
                    className="rounded-xl bg-gradient-warm text-primary-foreground shadow-button btn-press"
                    onClick={() => navigate("/dashboard/resident/payments")}
                  >
                    Pay Now
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <CheckCircle2 className="w-8 h-8 mx-auto text-green-500 mb-2" />
                <p>No dues pending! You are all caught up.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ResidentDashboard;
