import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Users,
  LogIn,
  Clock,
  History,
  ChevronRight,
  User,
  MapPin,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface DashboardStats {
  visitorsToday: number;
  currentVisitors: number;
}

interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  entryTime: string;
  status: "ENTERED" | "EXITED" | "PENDING";
  documentImage?: string;
}

export default function GuardDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentVisitors, setRecentVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, visitorsRes] = await Promise.all([
          api.get("/admin/dashboard"),
          api.get("/visitors"),
        ]);
        setStats(statsRes.data.data);
        // Get last 5 visitors
        setRecentVisitors(visitorsRes.data.data.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Security Control
          </h1>
          <p className="text-lg text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Primary Action - Hero Button */}
      <div
        onClick={() => navigate("/dashboard/guard/add-visitor")}
        className="relative overflow-hidden group cursor-pointer bg-gradient-to-r from-orange-500 to-red-500 rounded-3xl p-8 shadow-2xl hover:shadow-orange-500/30 transition-all duration-300 transform hover:-translate-y-1"
      >
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Users className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">
                Log New Entry
              </h2>
              <p className="text-orange-100 font-medium">
                Register a new visitor arrival
              </p>
            </div>
          </div>
          <div className="hidden md:flex h-12 w-12 bg-white/20 rounded-full items-center justify-center group-hover:bg-white group-hover:text-orange-600 transition-colors">
            <ChevronRight className="h-6 w-6 text-white group-hover:text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Stats & Quick Links */}
        <div className="lg:col-span-2 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="bg-blue-50/50 border-blue-100 hover:border-blue-200 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
                    <Users className="h-6 w-6" />
                  </div>
                  <Badge
                    variant="secondary"
                    className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none"
                  >
                    Today
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-blue-900">
                    {loading ? "..." : stats?.visitorsToday || 0}
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
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none"
                  >
                    Active
                  </Badge>
                </div>
                <div className="space-y-1">
                  <h3 className="text-4xl font-bold text-emerald-900">
                    {loading ? "..." : stats?.currentVisitors || 0}
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
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Quick Access
            </h3>
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
                    <h4 className="font-bold text-gray-900">Mark Exits</h4>
                    <p className="text-sm text-gray-500">
                      View active visitors
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
                    <h4 className="font-bold text-gray-900">View History</h4>
                    <p className="text-sm text-gray-500">Search past logs</p>
                  </div>
                  <ChevronRight className="ml-auto h-5 w-5 text-gray-300 group-hover:text-purple-500 transition-colors" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Recent Activity */}
        <div className="lg:col-span-1">
          <Card className="h-full border-none shadow-lg bg-gray-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-orange-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="px-2">
              <div className="space-y-4">
                {recentVisitors.length === 0 ? (
                  <div className="text-gray-400 text-center py-10">
                    No recent activity
                  </div>
                ) : (
                  recentVisitors.map((visitor) => (
                    <div
                      key={visitor.id}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-orange-400" />
                          <span className="font-semibold text-sm">
                            {visitor.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 font-mono">
                          {new Date(visitor.entryTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <MapPin className="h-3 w-3" />
                        <span>
                          {visitor.wing}-{visitor.flatNumber}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-gray-600" />
                        <span>{visitor.purpose}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
