import { useState, useMemo, useCallback, useEffect } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search, RefreshCw, Clock, CheckCircle2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useVisitors } from "@/hooks/useQueries";

interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  visitorType?: string;
  vehicleNumber?: string;
  entryTime: string;
  exitTime?: string;
  status: "ENTERED" | "EXITED" | "PENDING" | "APPROVED";
  documentImage?: string;
  contact?: string;
}

export default function TodaysLog() {
  const [exiting, setExiting] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const { user } = useAuth();

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const { data: visitorsResponse, isLoading: loading, refetch } = useVisitors(1, 200, debouncedSearch, "", "today");
  const visitors = useMemo(() => (visitorsResponse?.data || []) as Visitor[], [visitorsResponse]);

  const handleExit = async (id: string) => {
    setExiting(id);
    try {
      await api.patch(`/visitors/${id}/exit`);
      toast.success("Visitor marked as exited");
      refetch();
    } catch (error) {
      toast.error("Failed to mark exit");
    } finally {
      setExiting(null);
    }
  };

  const activeCount = useMemo(
    () => visitors.filter((v) => v.status === "ENTERED").length,
    [visitors],
  );
  const exitedCount = useMemo(
    () => visitors.filter((v) => v.status === "EXITED").length,
    [visitors],
  );

  const userName = user?.name || "Guard";

  return (
    <DashboardLayout role="guard" userName={userName}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Today's Log
            </h1>
            <p className="text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl border-border bg-background hover:bg-muted"
            onClick={() => refetch()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-semibold text-blue-500 dark:text-blue-400">
              {visitors.length} Total Today
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-500 dark:text-emerald-400">
              {activeCount} Currently Inside
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-500/10 border border-gray-500/20 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {exitedCount} Exited
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search visitors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-background shadow-sm border-border focus:border-emerald-500 rounded-xl"
          />
        </div>

        {/* Table */}
        <Card className="border-none shadow-xl bg-card backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden border border-border">
              <Table>
                <TableHeader className="bg-muted/80">
                  <TableRow>
                    <TableHead className="font-semibold text-muted-foreground">
                      Visitor
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Unit
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Purpose / Type
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Entry
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Exit
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <TableCell key={j}>
                            <Skeleton className="h-4 w-full rounded" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {visitors.map((visitor) => (
                        <TableRow
                          key={visitor.id}
                          className={`hover:bg-emerald-500/10 transition-colors ${
                            visitor.status === "EXITED" ? "opacity-60" : ""
                          }`}
                        >
                          {/* Visitor Name */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground">
                                {visitor.name}
                              </span>
                              {visitor.contact && (
                                <span className="text-xs text-muted-foreground">
                                  {visitor.contact}
                                </span>
                              )}
                              {visitor.documentImage && (
                                <span className="inline-flex w-fit items-center gap-1 mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 dark:text-blue-400 font-medium">
                                  📷 Doc Scanned
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Unit */}
                          <TableCell>
                            <Badge className="font-mono text-xs bg-muted text-muted-foreground border-none">
                              {visitor.wing}-{visitor.flatNumber}
                            </Badge>
                          </TableCell>

                          {/* Purpose + Type */}
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 dark:text-orange-400 font-medium w-fit">
                                {visitor.purpose}
                              </span>
                              {visitor.visitorType && (
                                <span className="text-[10px] text-muted-foreground">
                                  {visitor.visitorType}
                                  {visitor.vehicleNumber &&
                                    ` · ${visitor.vehicleNumber}`}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Entry */}
                          <TableCell className="text-muted-foreground font-medium tabular-nums">
                            {visitor.status === "ENTERED" ||
                            visitor.status === "EXITED"
                              ? new Date(visitor.entryTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "—"}
                          </TableCell>

                          {/* Exit */}
                          <TableCell className="text-muted-foreground tabular-nums">
                            {visitor.exitTime
                              ? new Date(visitor.exitTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )
                              : "—"}
                          </TableCell>

                          {/* Action */}
                          <TableCell className="text-right">
                            {visitor.status === "ENTERED" ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20"
                                disabled={exiting === visitor.id}
                                onClick={() => handleExit(visitor.id)}
                              >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                {exiting === visitor.id ? "..." : "Mark Exit"}
                              </Button>
                            ) : (
                              <Badge className="bg-muted text-muted-foreground border-none">
                                Exited
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {visitors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                <Clock className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <p className="font-medium">
                                No logs for today yet
                              </p>
                              <p className="text-sm">
                                New entries will appear here automatically
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
