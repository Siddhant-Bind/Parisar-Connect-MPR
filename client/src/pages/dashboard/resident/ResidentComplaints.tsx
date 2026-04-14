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
import { Loader2, Plus, MessageSquare, Clock, Filter } from "lucide-react";
import { toast } from "sonner";
import { Complaint } from "@/types";
import { useComplaints } from "@/hooks/useQueries";
import { useCreateComplaint } from "@/hooks/useMutations";
import { useAuth } from "@/context/AuthProvider";

const ResidentComplaints = () => {
  const [open, setOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterOwnership, setFilterOwnership] = useState("ALL");
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "MAINTENANCE",
    customCategory: "",
    priority: "MEDIUM",
  });

  const { data, isLoading: loading } = useComplaints(1, 100);
  const complaints = data?.data || [];
  const createComplaintMutation = useCreateComplaint();

  const filteredComplaints = complaints.filter((c) => {
    if (filterCategory !== "ALL" && c.category !== filterCategory) return false;
    if (filterOwnership === "MINE" && c.residentId !== user.id) return false;
    if (filterOwnership === "OTHERS" && c.residentId === user.id) return false;
    return true;
  });

  const handleCreate = () => {
    if (isLocked) return;
    setIsLocked(true);
    const payload = {
      title: formData.title,
      description: formData.description,
      category:
        formData.category === "OTHER"
          ? formData.customCategory || "OTHER"
          : formData.category,
      priority: formData.priority,
    };
    createComplaintMutation.mutate(payload, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          title: "",
          description: "",
          category: "MAINTENANCE",
          customCategory: "",
          priority: "MEDIUM",
        });
      },
      onSettled: () => {
        setTimeout(() => setIsLocked(false), 3000);
      },
    });
  };

  return (
    <DashboardLayout role="resident" userName={user?.name || "Resident"}>
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
                  placeholder="Complaint Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Describe your complaint in detail..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        category: v,
                        customCategory: "",
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                      <SelectItem value="SECURITY">Security</SelectItem>
                      <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
                      <SelectItem value="GENERAL">General</SelectItem>
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
                {formData.category === "OTHER" && (
                  <Input
                    placeholder="Enter complaint type..."
                    value={formData.customCategory}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customCategory: e.target.value,
                      })
                    }
                  />
                )}
                <Button
                  onClick={handleCreate}
                  disabled={createComplaintMutation.isPending || isLocked}
                  className="w-full bg-gradient-warm text-white"
                >
                  {createComplaintMutation.isPending && (
                    <Loader2 className="animate-spin w-4 h-4 mr-2" />
                  )}
                  {isLocked && !createComplaintMutation.isPending
                    ? "Submitted..."
                    : "Submit Complaint"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select
            value={filterCategory}
            onValueChange={setFilterCategory}
            disabled={filterOwnership === "OTHERS"}
          >
            <SelectTrigger className="w-[150px] h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
              <SelectItem value="SECURITY">Security</SelectItem>
              <SelectItem value="CLEANLINESS">Cleanliness</SelectItem>
              <SelectItem value="GENERAL">General</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterOwnership}
            onValueChange={(v) => {
              setFilterOwnership(v);
              if (v === "OTHERS") setFilterCategory("GENERAL");
            }}
          >
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Posted by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Complaints</SelectItem>
              <SelectItem value="MINE">My Complaints</SelectItem>
              <SelectItem value="OTHERS">Others</SelectItem>
            </SelectContent>
          </Select>
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
                  <Badge className={`font-medium ${
                      complaint.status === 'REJECTED' ? 'bg-red-500 hover:bg-red-600' : 
                      complaint.status === 'IN_PROGRESS' ? 'bg-green-400 hover:bg-green-500' : 
                      complaint.status === 'RESOLVED' ? 'bg-green-600 hover:bg-green-700' : 
                      'bg-blue-500 hover:bg-blue-600'
                    }`}>
                    {complaint.status === 'IN_PROGRESS' ? 'IN PROGRESS' : complaint.status}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {complaint.description}
                  </p>
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-xs text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{" "}
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </span>
                    {complaint.history && complaint.history.length > 0 && (
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
            {filteredComplaints.length === 0 && (
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

export default ResidentComplaints;
