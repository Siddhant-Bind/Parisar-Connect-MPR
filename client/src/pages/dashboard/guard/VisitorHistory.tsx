import { useEffect, useState, useCallback } from "react";
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";
import { toast } from "sonner";
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
import { Search, Filter, CalendarDays, ImageIcon, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

const statusStyles: Record<string, string> = {
  ENTERED: "bg-emerald-100 text-emerald-700",
  EXITED: "bg-gray-100 text-gray-600",
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-blue-100 text-blue-700",
};

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  const fetchVisitors = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      setVisitors(response.data.data || []);
    } catch (error) {
      toast.error("Failed to fetch visitor history");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVisitors();
  }, [fetchVisitors]);

  const filteredVisitors = visitors.filter((v) => {
    const matchesSearch =
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNumber.includes(search) ||
      v.wing.toLowerCase().includes(search.toLowerCase()) ||
      v.purpose.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const userName =
    safeParseJSON<{name?: string}>(localStorage.getItem("user"), {}).name || "Guard";

  return (
    <DashboardLayout role="guard" userName={userName}>
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Visitor History
          </h1>
          <p className="text-muted-foreground text-lg">
            Complete archive of all visitor logs
          </p>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder=""
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-purple-500 rounded-xl"
            />
          </div>

          {/* Status Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <Filter className="h-4 w-4 text-gray-400" />
            {["ALL", "ENTERED", "EXITED", "APPROVED"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
            <Badge
              variant="outline"
              className="h-8 px-3 rounded-full bg-purple-50 text-purple-700 border-purple-200 ml-1"
            >
              {filteredVisitors.length} records
            </Badge>
          </div>
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
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Entry
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Exit
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Doc
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
                      Status
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <TableRow key={i}>
                        {Array.from({ length: 7 }).map((_, j) => (
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
                          className="hover:bg-purple-50/20 transition-colors"
                        >
                          {/* Visitor Info */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-gray-900 text-sm">
                                {visitor.name}
                              </span>
                              {visitor.contact && (
                                <span className="text-xs text-gray-400">
                                  {visitor.contact}
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

                          {/* Entry Date + Time */}
                          <TableCell className="text-gray-600 text-sm">
                            <div className="flex flex-col">
                              <span className="font-medium">
                                {new Date(visitor.entryTime).toLocaleDateString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                  },
                                )}
                              </span>
                              <span className="text-xs text-gray-400 tabular-nums">
                                {new Date(visitor.entryTime).toLocaleTimeString(
                                  [],
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </span>
                            </div>
                          </TableCell>

                          {/* Exit Time */}
                          <TableCell className="text-gray-500 tabular-nums text-sm">
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

                          {/* Document */}
                          <TableCell>
                            {visitor.documentImage ? (
                              <button
                                onClick={() => {
                                  setPreviewImage(visitor.documentImage!);
                                  setPreviewName(visitor.name);
                                }}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-medium hover:bg-blue-100 transition-colors"
                              >
                                <ImageIcon className="h-3 w-3" />
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-gray-300">—</span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                statusStyles[visitor.status] ||
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {visitor.status}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}

                      {filteredVisitors.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-16">
                            <div className="flex flex-col items-center gap-3 text-muted-foreground">
                              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center">
                                <Search className="h-6 w-6 text-purple-300" />
                              </div>
                              <p className="font-medium">No visitors found</p>
                              <p className="text-sm">
                                Try adjusting your search or filter
                              </p>
                              {(search || statusFilter !== "ALL") && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-purple-600 hover:text-purple-700"
                                  onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                  }}
                                >
                                  <X className="h-3 w-3 mr-1" /> Clear filters
                                </Button>
                              )}
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

      {/* Document Preview Dialog */}
      <Dialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-500" />
              Document — {previewName}
            </DialogTitle>
          </DialogHeader>
          {previewImage && (
            <div className="relative rounded-xl overflow-hidden bg-gray-100">
              <img
                src={previewImage}
                alt={`Document for ${previewName}`}
                className="w-full object-contain max-h-[60vh]"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
