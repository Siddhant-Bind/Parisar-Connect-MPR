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
import { Loader2, MessageSquare, CheckCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Complaint {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  status: "OPEN" | "IN_PROGRESS" | "RESOLVED" | "REJECTED";
  createdAt: string;
  resident?: {
    name: string;
    flatNumber: string;
    wing: string;
  };
}

const Complaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/admin/complaints");
      if (res.data.success) setComplaints(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await api.patch(`/admin/complaints/${id}`, { status });
      if (res.data.success) {
        toast.success("Status updated");
        setComplaints(
          complaints.map((c) => (c._id === id ? { ...c, status } : c)),
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Resident Complaints</h1>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {complaints.map((complaint) => (
              <Card
                key={complaint._id}
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
                    defaultValue={complaint.status}
                    onValueChange={(val) => updateStatus(complaint._id, val)}
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
            {complaints.length === 0 && (
              <p className="text-center text-muted-foreground">
                No complaints found.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Complaints;
