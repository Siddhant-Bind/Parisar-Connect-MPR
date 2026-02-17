import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRightLeft, Clock, User } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Visitor {
  _id: string;
  name: string;
  purpose: string;
  wing: string;
  flatNumber: string;
  entryTime: string;
  exitTime?: string;
  status: "PENDING" | "APPROVED" | "ENTERED" | "EXITED";
}

const Visitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/admin/visitors");
      if (res.data.success) setVisitors(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch visitor logs");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Visitor Logs</h1>

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
                    <TableRow key={visitor._id}>
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
      </div>
    </DashboardLayout>
  );
};

export default Visitors;
