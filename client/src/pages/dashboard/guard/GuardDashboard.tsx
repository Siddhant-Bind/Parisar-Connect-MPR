import { useEffect, useState } from "react";
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
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";

interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  visitorType?: string;
  entryTime: string;
  exitTime?: string;
  status: "ENTERED" | "EXITED" | "PENDING" | "APPROVED";
  documentImage?: string;
  contact?: string;
}

const statusConfig = {
  ENTERED: { label: "Inside", color: "bg-emerald-500" },
  EXITED: { label: "Exited", color: "bg-gray-400" },
  PENDING: { label: "Pending", color: "bg-yellow-400" },
  APPROVED: { label: "Approved", color: "bg-blue-500" },
};

export default function GuardDashboard() {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const visitorsRes = await api.get("/visitors");
        setVisitors(visitorsRes.data.data || []);
      } catch (error) {
        toast.error("Failed to load visitor data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Compute stats from real visitor data
  const today = new Date().toDateString();
  const visitorsToday = visitors.filter(
    (v) => new Date(v.entryTime).toDateString() === today,
  );
  const currentlyInside = visitors.filter((v) => v.status === "ENTERED");
  const recentVisitors = [...visitors]
    .sort(
      (a, b) =>
        new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime(),
    )
    .slice(0, 5);

  const userName =
    safeParseJSON<{name?: string}>(localStorage.getItem("user"), {}).name || "Guard";

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
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">
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
              <Card className="bg-blue-50/50 border-blue-100 hover:border-blue-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                      <Users className="h-6 w-6" />
                    </div>
                    <Badge className="bg-blue-100 text-blue-700 border-none hover:bg-blue-100">
                      Today
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-blue-900">
                      {loading ? "..." : visitorsToday.length}
                    </h3>
                    <p className="text-sm text-blue-600 font-medium">
                      Total Entries
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-emerald-50/50 border-emerald-100 hover:border-emerald-200 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600">
                      <Clock className="h-6 w-6" />
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-700 border-none hover:bg-emerald-100">
                      Active
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-4xl font-bold text-emerald-900">
                      {loading ? "..." : currentlyInside.length}
                    </h3>
                    <p className="text-sm text-emerald-600 font-medium">
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
                  className="group cursor-pointer p-5 bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100 transition-colors">
                      <LogOut className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Today's Log</h4>
                      <p className="text-sm text-muted-foreground">
                        {loading
                          ? "..."
                          : `${visitorsToday.length} entries · ${currentlyInside.length} still inside`}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/history")}
                  className="group cursor-pointer p-5 bg-white rounded-2xl border border-gray-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-purple-50 text-purple-600 group-hover:bg-purple-100 transition-colors">
                      <History className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Full History</h4>
                      <p className="text-sm text-muted-foreground">
                        {loading ? "..." : `${visitors.length} total records`}
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/pre-approved")}
                  className="group cursor-pointer p-5 bg-white rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">Pre-Approved</h4>
                      <p className="text-sm text-muted-foreground">
                        Check resident approvals
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                <div
                  onClick={() => navigate("/dashboard/guard/visitors")}
                  className="group cursor-pointer p-5 bg-white rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg hover:shadow-orange-500/5 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-orange-100 transition-colors">
                      <Car className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="font-bold">All Visitors</h4>
                      <p className="text-sm text-muted-foreground">
                        Manage all entries
                      </p>
                    </div>
                    <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-orange-500 transition-colors" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right — Live Activity Feed */}
          <div className="lg:col-span-1">
            <Card className="h-full border-none shadow-lg bg-gray-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Live Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="px-2">
                <div className="space-y-3">
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton
                        key={i}
                        className="h-16 rounded-xl bg-white/10"
                      />
                    ))
                  ) : recentVisitors.length === 0 ? (
                    <div className="text-gray-400 text-center py-10 flex flex-col items-center gap-2">
                      <Shield className="h-8 w-8 text-gray-600" />
                      <p>No activity yet</p>
                    </div>
                  ) : (
                    recentVisitors.map((visitor) => {
                      const cfg =
                        statusConfig[visitor.status] || statusConfig.ENTERED;
                      return (
                        <div
                          key={visitor.id}
                          className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                        >
                          <div className="flex justify-between items-start mb-1.5">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4 text-orange-400 flex-shrink-0" />
                              <span className="font-semibold text-sm truncate max-w-[120px]">
                                {visitor.name}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-2 h-2 rounded-full ${cfg.color}`}
                              />
                              <span className="text-[10px] text-gray-400 font-medium">
                                {cfg.label}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {visitor.wing}-{visitor.flatNumber}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-gray-600" />
                            <span className="truncate">{visitor.purpose}</span>
                            <span className="ml-auto text-gray-500 font-mono">
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
