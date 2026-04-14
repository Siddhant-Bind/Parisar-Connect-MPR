import { useState, useEffect, useMemo } from "react";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
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
import { useVisitors } from "@/hooks/useQueries";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  ENTERED: "bg-emerald-500/10 text-emerald-500",
  EXITED: "bg-gray-500/10 text-muted-foreground",
  PENDING: "bg-yellow-500/10 text-yellow-500",
  APPROVED: "bg-blue-500/10 text-blue-500",
};

export default function VisitorHistory() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");

  // Debounce search to prevent excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const actualStatus = statusFilter === "ALL" ? "" : statusFilter;
  const { data: visitorsResponse, isLoading: loading } = useVisitors(page, 15, debouncedSearch, actualStatus);
  const filteredVisitors = useMemo(() => (visitorsResponse?.data || []) as Visitor[], [visitorsResponse]);
  const totalPages = visitorsResponse?.totalPages || 1;

  const userName =
    useAuth().user?.name || "Guard";

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
              className="pl-10 h-12 bg-background shadow-sm border-border focus:border-purple-500 rounded-xl"
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
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <Card className="border-none shadow-xl bg-card backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden border border-border">
              <Table>
                <TableHeader className="bg-muted/50">
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
                      <div className="flex items-center gap-1">
                        <CalendarDays className="h-3.5 w-3.5" />
                        Entry
                      </div>
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Exit
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground">
                      Doc
                    </TableHead>
                    <TableHead className="font-semibold text-muted-foreground text-right">
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
                          className="hover:bg-purple-500/10 transition-colors"
                        >
                          {/* Visitor Info */}
                          <TableCell>
                            <div className="flex flex-col gap-0.5">
                              <span className="font-semibold text-foreground text-sm">
                                {visitor.name}
                              </span>
                              {visitor.contact && (
                                <span className="text-xs text-muted-foreground">
                                  {visitor.contact}
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
                              <span className="text-xs px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 font-medium w-fit">
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

                          {/* Entry Date + Time */}
                          <TableCell className="text-muted-foreground text-sm">
                            <div className="flex flex-col">
                              {(visitor.status === "ENTERED" || visitor.status === "EXITED") ? (
                                <>
                                  <span className="font-medium text-foreground">
                                    {new Date(visitor.entryTime).toLocaleDateString(
                                      "en-IN",
                                      {
                                        day: "numeric",
                                        month: "short",
                                      },
                                    )}
                                  </span>
                                  <span className="text-xs tabular-nums text-muted-foreground">
                                    {new Date(visitor.entryTime).toLocaleTimeString(
                                      [],
                                      {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      },
                                    )}
                                  </span>
                                </>
                              ) : (
                                <span className="font-medium text-muted-foreground">—</span>
                              )}
                            </div>
                          </TableCell>

                          {/* Exit Time */}
                          <TableCell className="text-muted-foreground tabular-nums text-sm">
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
                                className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/10 text-blue-500 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                              >
                                <ImageIcon className="h-3 w-3" />
                                View
                              </button>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>

                          {/* Status */}
                          <TableCell className="text-right">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                statusStyles[visitor.status] ||
                                "bg-muted text-muted-foreground"
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
                              <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center">
                                <Search className="h-6 w-6 text-purple-500" />
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
            {/* Pagination Controls */}
            {!loading && filteredVisitors.length > 0 && totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Page <span className="font-semibold text-foreground">{page}</span> of{" "}
                  <span className="font-semibold text-foreground">{totalPages}</span>
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
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
