import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, MessageSquare, Clock } from "lucide-react";
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
  history: {
    status: string;
    remark: string;
    updatedAt: string;
  }[];
}

const ResidentComplaints = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MAINTENANCE",
    priority: "MEDIUM",
  });

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get("/complaints");
      if (res.data.success) setComplaints(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await api.post("/complaints", formData);
      if (res.data.success) {
        toast.success("Complaint registered successfully");
        setOpen(false);
        fetchComplaints();
        setFormData({
          title: "",
          description: "",
          category: "MAINTENANCE",
          priority: "MEDIUM",
        });
      }
    } catch (error) {
      toast.error("Failed to register complaint");
    }
  };

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Complaints</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-button btn-press bg-gradient-warm text-white">
                <Plus className="w-4 h-4 mr-2" /> New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register New Complaint</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title (e.g. Broken Tap)"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Describe the issue in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({ ...formData, category: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={formData.priority}
                    onValueChange={(v) =>
                      setFormData({ ...formData, priority: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={handleCreate}
                  className="w-full bg-gradient-warm text-white"
                >
                  Submit Complaint
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

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
                  <Badge variant="secondary">{complaint.status}</Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {complaint.description}
                  </p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    {complaint.history.length > 0 && (
                      <span className="italic">
                        Last update:{" "}
                        {complaint.history[
                          complaint.history.length - 1
                        ].remark.substring(0, 30)}
                        ...
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {complaints.length === 0 && (
              <p className="text-center text-muted-foreground">
                No complaints history.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResidentComplaints;
