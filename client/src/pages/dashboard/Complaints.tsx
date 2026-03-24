import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Search,
  Loader2,
  MessageSquare,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useComplaints } from "@/hooks/useQueries";
import { useUpdateComplaintStatus } from "@/hooks/useMutations";
import { safeParseJSON } from "@/lib/utils";

import { Complaint } from "@/types";
const Complaints = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading: loading } = useComplaints(page, limit);
  const complaints = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const updateStatusMutation = useUpdateComplaintStatus();

  const updateStatus = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  // TODO: Client-side search only filters the current page, not all complaints.
  // Consider server-side search for complete results.
  const filteredComplaints = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.resident?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.resident?.flatNumber.includes(searchQuery),
  );

  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Resident Complaints</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, resident, unit..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {filteredComplaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="shadow-soft hover:shadow-elevated transition-all"
              >
                <CardHeader className="flex flex-row justify-between items-start pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{complaint.title}</CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="outline">{complaint.category}</Badge>
                      <Badge
                        className={
                          complaint.priority === "HIGH"
                            ? "bg-red-500"
                            : complaint.priority === "MEDIUM"
                              ? "bg-orange-500"
                              : "bg-green-500"
                        }
                      >
                        {complaint.priority}
                      </Badge>
                    </div>
                  </div>
                  <Select
                    value={complaint.status}
                    onValueChange={(val) => updateStatus(complaint.id, val)}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {complaint.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <span className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Raised by:{" "}
                      <span className="font-semibold text-foreground">
                        {complaint.resident?.name || "Unknown"}
                      </span>{" "}
                      ({complaint.resident?.flatNumber}-
                      {complaint.resident?.wing})
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredComplaints.length === 0 && (
              <p className="text-center text-muted-foreground">
                No complaints found.
              </p>
            )}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || loading}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground w-20 text-center">
              Page {page} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || loading}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Complaints;
