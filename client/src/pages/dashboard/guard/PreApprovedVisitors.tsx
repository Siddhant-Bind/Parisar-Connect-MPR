import { useEffect, useState } from "react";
import api from "@/lib/api";
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
import { Check, Search, UserCheck, ClipboardList } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/context/AuthProvider";

interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  entryTime: string;
  status: "PENDING" | "APPROVED" | "ENTERED" | "EXITED";
}

export default function PreApprovedVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { user } = useAuth();

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      const visitorsList: Visitor[] = response.data.data?.data || response.data.data || [];
      const approved = visitorsList.filter(
        (v: Visitor) => v.status === "APPROVED",
      );
      setVisitors(approved);
    } catch (error) {
      toast.error("Failed to fetch pre-approved visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCheckIn = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/status`, { status: "ENTERED" });
      toast.success("Visitor checked in successfully");
      fetchVisitors();
    } catch (error) {
      toast.error("Failed to check in visitor");
    }
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNumber.includes(search) ||
      v.wing.toLowerCase().includes(search.toLowerCase()),
  );

  const userName = user?.name || "Guard";

  return (
    <DashboardLayout role="guard" userName={userName}>
      <div className="space-y-8 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Pre-approved Visitors
          </h1>
          <p className="text-muted-foreground text-lg">
            Expected arrivals approved by residents.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search by name, wing or flat..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
            />
          </div>
          <div className="flex gap-2">
            <Badge
              variant="outline"
              className="h-9 px-4 rounded-lg bg-blue-50 text-blue-700 border-blue-200"
            >
              {filteredVisitors.length} Expected
            </Badge>
          </div>
        </div>

        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="rounded-xl overflow-hidden border border-gray-100">
              <Table>
                <TableHeader className="bg-gray-50/50">
                  <TableRow>
                    <TableHead className="font-semibold text-gray-600">
                      Visitor Name
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Unit
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Purpose
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600">
                      Expected
                    </TableHead>
                    <TableHead className="font-semibold text-gray-600 text-right">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-4 w-24" />
                          </div>
                        </TableCell>
                        <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <>
                      {filteredVisitors.map((visitor) => (
                        <TableRow
                          key={visitor.id}
                          className="hover:bg-blue-50/30 transition-colors"
                        >
                          <TableCell className="font-medium text-gray-900">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                                {visitor.name.charAt(0)}
                              </div>
                              {visitor.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="font-mono text-xs bg-gray-100 text-gray-700"
                            >
                              {visitor.wing}-{visitor.flatNumber}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                              {visitor.purpose}
                            </span>
                          </TableCell>
                          <TableCell className="text-gray-500">
                            {new Date(visitor.entryTime).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-md rounded-lg transition-all"
                              onClick={() => handleCheckIn(visitor.id)}
                            >
                              <Check className="h-4 w-4 mr-1" /> Check In
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredVisitors.length === 0 && (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-16 text-muted-foreground"
                          >
                            <div className="flex flex-col items-center gap-3">
                              <div className="h-16 w-16 rounded-full bg-blue-50 flex items-center justify-center mb-1">
                                <ClipboardList className="h-8 w-8 text-blue-400" />
                              </div>
                              <p className="font-semibold text-base text-foreground">
                                No pre-approved visitors
                              </p>
                              <p className="text-sm max-w-xs">
                                Visitors will appear here once residents
                                pre-approve them from their dashboard.
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
