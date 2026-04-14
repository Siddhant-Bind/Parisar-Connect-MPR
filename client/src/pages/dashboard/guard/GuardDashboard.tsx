import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  Clock,
  History,
  ChevronRight,
  User,
  MapPin,
  LogOut,
  Shield,
  Car,
  FileText,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitors, useGuardStats } from "@/hooks/useQueries";
import { Visitor } from "@/types";

const statusConfig = {
  ENTERED: { label: "Inside", color: "bg-emerald-500" },
  EXITED: { label: "Exited", color: "bg-gray-400" },
  PENDING: { label: "Pending", color: "bg-yellow-400" },
  APPROVED: { label: "Approved", color: "bg-blue-500" },
};

export default function GuardDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: visitorsResponse, isLoading: loadingVisitors } = useVisitors(1, 5);
  const { data: guardStats, isLoading: loadingStats } = useGuardStats();

  const visitors = useMemo(
    () => visitorsResponse?.data ?? [],
    [visitorsResponse],
  ) as Visitor[];

  const visitorsTodayCount = guardStats?.totalEntriesToday || 0;
  const currentlyInsideCount = guardStats?.currentlyInside || 0;
  const totalHistoryCount = guardStats?.totalHistory || 0;
  const loading = loadingStats || loadingVisitors;

  const recentVisitors = [...visitors]
    .sort(
      (a, b) =>
        new Date(b.entryTime ?? 0).getTime() -
        new Date(a.entryTime ?? 0).getTime(),
    )
    .slice(0, 5);

  const userName = user?.name || "Guard";

  return (
    <DashboardLayout role="guard" userName={userName}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              Security Control
            </h1>
            <p className="text-lg text-muted-foreground mt-1">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-500">
              On Duty
            </span>
          </div>
        </div>

        {/* Primary CTA — Log Entry */}
        <div
          onClick={() => navigate("/dashboard/guard/add-visitor")}
          className="relative overflow-hidden group cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 hover:-translate-y-1"
        >
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                <Shield className="h-10 w-10 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white mb-1">
                  Log New Entry
                </h2>
                <p className="text-orange-100 font-medium">
                  Register a new visitor arrival with document scan
                </p>
              </div>
            </div>
            <div className="hidden md:flex h-12 w-12 bg-white/20 rounded-full items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-colors">
              <ChevronRight className="h-6 w-6 text-white group-hover:text-orange-600" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left — Stats + Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card className="bg-card border-border hover:border-blue-500/50 transition-colors shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                      <Users className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-0">
                      Today
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-foreground">
                      {loadingStats ? <Skeleton className="h-10 w-20" /> : visitorsTodayCount}
                    </h3>
                    <p className="text-sm text-blue-500 font-medium">
                      Total Entries
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-card border-border hover:border-emerald-500/50 transition-colors shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500">
                      <Clock className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-0">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-foreground">
                      {loadingStats ? <Skeleton className="h-10 w-20" /> : currentlyInsideCount}
                    </h3>
                    <p className="text-sm text-emerald-500 font-medium">
                      Currently Inside
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Access</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div
                  onClick={() => navigate("/dashboard/guard/todays-log")}
                  className="group cursor-pointer p-5 bg-card rounded-2xl border border-border hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
                      <LogOut className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Today's Log</h4>
                      <p className="text-sm text-muted-foreground">
                        {loadingStats
                          ? <Skeleton className="h-4 w-32 mt-1" />
                          : `${visitorsTodayCount} entries · ${currentlyInsideCount} still inside`}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/history")}
                  className="group cursor-pointer p-5 bg-card rounded-2xl border border-border hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                      <History className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Full History</h4>
                      <p className="text-sm text-muted-foreground">
                        {loadingStats ? <Skeleton className="h-4 w-24 mt-1" /> : `${totalHistoryCount} total records`}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/pre-approved")}
                  className="group cursor-pointer p-5 bg-card rounded-2xl border border-border hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">Pre-Approved</h4>
                      <p className="text-sm text-muted-foreground">
                        Check resident approvals
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/visitors")}
                  className="group cursor-pointer p-5 bg-card rounded-2xl border border-border hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/10 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500 group-hover:bg-orange-500/20 transition-colors">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground">All Visitors</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage all entries
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-muted-foreground/40 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Live Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="h-full shadow-lg border bg-card text-card-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Live Activity
                </CardTitle>
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Inside
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-gray-400" /> Exited
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Approved
                  </span>
                </div>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 rounded-xl bg-muted"
                      />
                    ))
                  ) : recentVisitors.length === 0 ? (
                    <div className="text-muted-foreground text-center py-10 flex flex-col items-center gap-2">
                      <Shield className="h-8 w-8 text-muted-foreground/60" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    recentVisitors.map((visitor) => {
                      const cfg =
                        statusConfig[visitor.status] || statusConfig.ENTERED;
                      return (
                        <div
                          key={visitor.id}
                          className="p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors border border-border/50"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-orange-400 flex-shrink-0" />
                              <span className="font-semibold text-sm truncate max-w-[120px] text-foreground">
                                {visitor.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${cfg.color}`}
                              />
                              <span className="text-[10px] text-muted-foreground font-medium">
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {visitor.wing}-{visitor.flatNumber}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <span className="truncate">{visitor.purpose}</span>
                            <span className="ml-auto text-muted-foreground font-mono">
                              {new Date(visitor.entryTime).toLocaleTimeString(
                                [],
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
