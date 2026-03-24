import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Users,
  CheckCircle2,
  CreditCard,
  UserCheck,
  TrendingUp,
  AlertCircle,
  Loader2,
  BarChart3,
  FileText,
} from "lucide-react";
import { useReportStats } from "@/hooks/useQueries";
import { safeParseJSON } from "@/lib/utils";

const CHART_COLORS = {
  primary: "hsl(var(--primary))",
  destructive: "hsl(var(--destructive))",
  accent1: "#6366f1",
  accent2: "#f59e0b",
  accent3: "#10b981",
  accent4: "#ec4899",
  accent5: "#8b5cf6",
};

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ec4899", "#8b5cf6"];

const Reports = () => {
  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);
  const { data: stats, isLoading } = useReportStats();

  const summary = stats?.summary || {};
  const monthlyComplaints = stats?.monthlyComplaints || [];
  const monthlyPayments = stats?.monthlyPayments || [];
  const monthlyVisitors = stats?.monthlyVisitors || [];
  const topCategories = stats?.topCategories || [];

  const summaryCards = [
    {
      title: "Total Residents",
      value: summary.totalResidents ?? 0,
      icon: Users,
      subtitle: `${summary.visitorsThisMonth ?? 0} visitors this month`,
      gradient: "from-indigo-500/10 to-indigo-500/5",
      iconBg: "bg-indigo-500/15",
      iconColor: "text-indigo-500",
    },
    {
      title: "Complaint Resolution",
      value: `${summary.complaintResolutionRate ?? 0}%`,
      icon: CheckCircle2,
      subtitle: `${summary.resolvedComplaints ?? 0} resolved of ${summary.totalComplaints ?? 0}`,
      gradient: "from-emerald-500/10 to-emerald-500/5",
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      title: "Payment Collection",
      value: `₹${((summary.paidPaymentAmount ?? 0) / 1000).toFixed(1)}K`,
      icon: CreditCard,
      subtitle: `${summary.paymentCollectionRate ?? 0}% collection rate`,
      gradient: "from-amber-500/10 to-amber-500/5",
      iconBg: "bg-amber-500/15",
      iconColor: "text-amber-500",
    },
    {
      title: "Visitors This Month",
      value: summary.visitorsThisMonth ?? 0,
      icon: UserCheck,
      subtitle: `${summary.totalVisitors ?? 0} all time`,
      gradient: "from-pink-500/10 to-pink-500/5",
      iconBg: "bg-pink-500/15",
      iconColor: "text-pink-500",
    },
  ];

  const tooltipStyle = {
    backgroundColor: "hsl(var(--card))",
    borderColor: "hsl(var(--border))",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    fontSize: "13px",
  };

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Header */}
        <div className="animate-fade-in-up">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-primary/10">
              <BarChart3 className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                Society Reports
              </h1>
              <p className="text-muted-foreground text-sm">
                Analytics and insights for{" "}
                {user.society?.name || "your society"}
              </p>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">
              Loading analytics...
            </p>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-100">
              {summaryCards.map((card, i) => (
                <Card
                  key={i}
                  className={`border-0 shadow-soft hover:shadow-elevated transition-all duration-300 rounded-2xl overflow-hidden bg-gradient-to-br ${card.gradient}`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                        <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                      </div>
                      <TrendingUp className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-0.5">
                      {card.value}
                    </p>
                    <p className="text-sm font-medium text-foreground/80 mb-1">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {card.subtitle}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 animate-fade-in-up delay-200">
              {/* Complaints Trend */}
              <Card className="rounded-2xl shadow-soft border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-indigo-500" />
                    Complaint Trends
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Active vs resolved complaints over last 6 months
                  </p>
                </CardHeader>
                <CardContent>
                  {monthlyComplaints.length === 0 ? (
                    <EmptyChart message="No complaint data yet" />
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyComplaints}>
                          <defs>
                            <linearGradient
                              id="colorOpen"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.destructive}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.destructive}
                                stopOpacity={0}
                              />
                            </linearGradient>
                            <linearGradient
                              id="colorResolved"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.accent3}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.accent3}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Legend
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "8px",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="open"
                            name="Active"
                            stroke={CHART_COLORS.destructive}
                            strokeWidth={2.5}
                            fill="url(#colorOpen)"
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                          />
                          <Area
                            type="monotone"
                            dataKey="resolved"
                            name="Resolved"
                            stroke={CHART_COLORS.accent3}
                            strokeWidth={2.5}
                            fill="url(#colorResolved)"
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Payment Collection */}
              <Card className="rounded-2xl shadow-soft border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-amber-500" />
                    Payment Collection
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Collected vs pending payments (₹)
                  </p>
                </CardHeader>
                <CardContent>
                  {monthlyPayments.length === 0 ? (
                    <EmptyChart message="No payment data yet" />
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyPayments} barGap={4}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={tooltipStyle}
                            formatter={(value: number) =>
                              `₹${value.toLocaleString()}`
                            }
                          />
                          <Legend
                            wrapperStyle={{
                              fontSize: "12px",
                              paddingTop: "8px",
                            }}
                          />
                          <Bar
                            dataKey="paid"
                            name="Collected"
                            fill={CHART_COLORS.accent3}
                            radius={[6, 6, 0, 0]}
                          />
                          <Bar
                            dataKey="pending"
                            name="Pending"
                            fill={CHART_COLORS.accent2}
                            radius={[6, 6, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Visitor Trends */}
              <Card className="rounded-2xl shadow-soft border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-pink-500" />
                    Visitor Trends
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Monthly visitor footfall
                  </p>
                </CardHeader>
                <CardContent>
                  {monthlyVisitors.length === 0 ? (
                    <EmptyChart message="No visitor data yet" />
                  ) : (
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={monthlyVisitors}>
                          <defs>
                            <linearGradient
                              id="colorVisitors"
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={CHART_COLORS.accent4}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={CHART_COLORS.accent4}
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="hsl(var(--border))"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            stroke="hsl(var(--muted-foreground))"
                            fontSize={11}
                            tickLine={false}
                            axisLine={false}
                            allowDecimals={false}
                          />
                          <Tooltip contentStyle={tooltipStyle} />
                          <Area
                            type="monotone"
                            dataKey="count"
                            name="Visitors"
                            stroke={CHART_COLORS.accent4}
                            strokeWidth={2.5}
                            fill="url(#colorVisitors)"
                            dot={{ r: 3, strokeWidth: 2 }}
                            activeDot={{ r: 5, strokeWidth: 2 }}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Complaint Categories */}
              <Card className="rounded-2xl shadow-soft border-0">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-violet-500" />
                    Top Complaint Categories
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    Most common complaint types
                  </p>
                </CardHeader>
                <CardContent>
                  {topCategories.length === 0 ? (
                    <EmptyChart message="No complaints filed yet" />
                  ) : (
                    <div className="h-[280px] flex items-center gap-4">
                      {/* Pie Chart */}
                      <div className="w-1/2 h-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={topCategories}
                              dataKey="count"
                              nameKey="category"
                              cx="50%"
                              cy="50%"
                              outerRadius={90}
                              innerRadius={50}
                              strokeWidth={2}
                              stroke="hsl(var(--card))"
                            >
                              {topCategories.map(
                                (_: unknown, index: number) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      {/* Legend List */}
                      <div className="w-1/2 space-y-3">
                        {topCategories.map(
                          (
                            cat: { category: string; count: number },
                            i: number,
                          ) => (
                            <div
                              key={cat.category}
                              className="flex items-center gap-3"
                            >
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{
                                  backgroundColor:
                                    PIE_COLORS[i % PIE_COLORS.length],
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate capitalize">
                                  {cat.category
                                    .toLowerCase()
                                    .replace(/_/g, " ")}
                                </p>
                                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                                  <div
                                    className="h-1.5 rounded-full transition-all duration-500"
                                    style={{
                                      width: `${Math.min(100, (cat.count / Math.max(...topCategories.map((c: { count: number }) => c.count))) * 100)}%`,
                                      backgroundColor:
                                        PIE_COLORS[i % PIE_COLORS.length],
                                    }}
                                  />
                                </div>
                              </div>
                              <span className="text-sm font-bold text-foreground tabular-nums">
                                {cat.count}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-up delay-300">
              <MiniStat
                label="Open Complaints"
                value={summary.openComplaints ?? 0}
                color="text-red-500"
              />
              <MiniStat
                label="Resolved"
                value={summary.resolvedComplaints ?? 0}
                color="text-emerald-500"
              />
              <MiniStat
                label="Pending Dues"
                value={`₹${((summary.pendingPaymentAmount ?? 0) / 1000).toFixed(1)}K`}
                color="text-amber-500"
              />
              <MiniStat
                label="Total Visitors"
                value={summary.totalVisitors ?? 0}
                color="text-pink-500"
              />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

const EmptyChart = ({ message }: { message: string }) => (
  <div className="h-[280px] flex flex-col items-center justify-center text-muted-foreground gap-2">
    <BarChart3 className="w-10 h-10 opacity-30" />
    <p className="text-sm">{message}</p>
  </div>
);

const MiniStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) => (
  <Card className="rounded-2xl border-0 shadow-soft">
    <CardContent className="p-4 text-center">
      <p className={`text-xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
    </CardContent>
  </Card>
);

export default Reports;
