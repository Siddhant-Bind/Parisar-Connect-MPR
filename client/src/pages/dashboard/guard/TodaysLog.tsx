import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";
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
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [exiting, setExiting] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      const all: Visitor[] = response.data.data || [];
      const today = new Date().toDateString();
      const todaysVisitors = all.filter(
        (v) => new Date(v.entryTime).toDateString() === today,
      );
      setVisitors(todaysVisitors);
    } catch (error) {
      toast.error("Failed to fetch today's logs");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const handleExit = async (id: string) => {
    setExiting(id);
    try {
      await api.patch(`/visitors/${id}/exit`);
      toast.success("Visitor marked as exited");
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === id
            ? { ...v, status: "EXITED", exitTime: new Date().toISOString() }
            : v,
        ),
      );
    } catch (error) {
      toast.error("Failed to mark exit");
    } finally {
      setExiting(null);
    }
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNumber.includes(search) ||
      v.wing.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose.toLowerCase().includes(search.toLowerCase()),
  );

  const activeCount = filteredVisitors.filter(
    (v) => v.status === "ENTERED",
  ).length;
  const userName =
    safeParseJSON<{name?: string}>(localStorage.getItem("user"), {}).name || "Guard";

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
            className="gap-2 rounded-xl"
            onClick={fetchVisitors}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Badges */}
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full">
            <Clock className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">
              {visitors.length} Total Today
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">
              {activeCount} Currently Inside
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full">
            <CheckCircle2 className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-semibold text-gray-600">
              {visitors.filter((v) => v.status === "EXITED").length} Exited
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-emerald-500 rounded-xl"
          />
        </div>

        {/* Table */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Table>
                <TableHeader className="bg-gray-50/80">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600">
                      Visitor
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Unit
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Purpose / Type
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Entry
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Exit
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
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
                      {filteredVisitors.map((visitor) => (
                        <TableRow
                          key={visitor.id}
                          className={`hover:bg-emerald-50/30 transition-colors ${
                            visitor.status === "EXITED" ? "opacity-60" : ""
                          }`}
                        >
                          {/* Visitor Name */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-gray-900">
                                {visitor.name}
                              </span>
                              {visitor.contact && (
                                <span className="text-xs text-gray-400">
                                  {visitor.contact}
                                </span>
                              )}
                              {visitor.documentImage && (
                                <span className="inline-flex w-fit items-center gap-1 mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-600 font-medium">
                                  📷 Doc Scanned
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Unit */}
                          <TableCell>
                            <Badge className="font-mono text-xs bg-gray-100 text-gray-700 hover:bg-gray-100 border-none">
                              {visitor.wing}-{visitor.flatNumber}
                            </Badge>
                          </TableCell>

                          {/* Purpose + Type */}
                          <TableCell>
                            <div className="flex flex-col gap-1">
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 font-medium w-fit">
                                {visitor.purpose}
                              </span>
                              {visitor.visitorType && (
                                <span className="text-[10px] text-gray-400">
                                  {visitor.visitorType}
                                  {visitor.vehicleNumber &&
                                    ` · ${visitor.vehicleNumber}`}
                                </span>
                              )}
                            </div>
                          </TableCell>

                          {/* Entry */}
                          <TableCell className="text-gray-600 font-medium tabular-nums">
                            {new Date(visitor.entryTime).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </TableCell>

                          {/* Exit */}
                          <TableCell className="text-gray-500 tabular-nums">
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
                                className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                                disabled={exiting === visitor.id}
                                onClick={() => handleExit(visitor.id)}
                              >
                                <LogOut className="h-3.5 w-3.5 mr-1" />
                                {exiting === visitor.id ? "..." : "Mark Exit"}
                              </Button>
                            ) : (
                              <Badge className="bg-gray-100 text-gray-500 border-none hover:bg-gray-100">
                                Exited
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredVisitors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <Clock className="h-6 w-6 text-gray-400" />
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
