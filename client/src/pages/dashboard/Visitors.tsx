import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRightLeft, Clock, User, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Visitor } from "@/types";
import { useVisitors } from "@/hooks/useQueries";
import { useAuth } from "@/context/AuthProvider";

const Visitors = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, isLoading: loading } = useVisitors(page, limit, debouncedSearch);
  const visitors = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const { user } = useAuth();

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Visitor Logs</h1>
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search visitors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle>Entry / Exit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Flat</TableHead>
                    <TableHead>Entry Time</TableHead>
                    <TableHead>Exit Time</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id}>
                      <TableCell className="font-medium">
                        {visitor.name}
                      </TableCell>
                      <TableCell>{visitor.purpose}</TableCell>
                      <TableCell>
                        {visitor.wing}-{visitor.flatNumber}
                      </TableCell>
                      <TableCell>
                        {visitor.entryTime
                          ? new Date(visitor.entryTime).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {visitor.exitTime
                          ? new Date(visitor.exitTime).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            visitor.status === "EXITED"
                              ? "secondary"
                              : "default"
                          }
                          className={
                            visitor.status === "ENTERED"
                              ? "bg-green-500 hover:bg-green-600"
                              : ""
                          }
                        >
                          {visitor.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visitors.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No visitor logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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

export default Visitors;
