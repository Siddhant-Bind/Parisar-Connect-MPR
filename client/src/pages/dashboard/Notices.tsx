import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Bell, Plus, Trash2, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: "INFO" | "EVENT" | "ALERT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO",
    priority: "MEDIUM",
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      // Keep public read for list, or use admin route if this is admin page (it is)
      const res = await api.get("/notices");
      if (res.data.success) setNotices(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await api.post("/admin/notices", formData);
      if (res.data.success) {
        toast.success("Notice created");
        setOpen(false);
        fetchNotices();
        setFormData({
          title: "",
          content: "",
          type: "INFO",
          priority: "MEDIUM",
        });
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("Failed to create notice");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/admin/notices/${id}`);
      toast.success("Notice deleted");
      setNotices(notices.filter((n) => n._id !== id));
    } catch (error) {
      toast.error("Failed to delete notice");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Notices & Announcements</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-button btn-press bg-gradient-warm text-white">
                <Plus className="w-4 h-4 mr-2" /> Create Notice
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Notice</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                />
                <Textarea
                  placeholder="Content"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                />
                <div className="flex gap-4">
                  <Select
                    value={formData.type}
                    onValueChange={(v) => setFormData({ ...formData, type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INFO">Info</SelectItem>
                      <SelectItem value="EVENT">Event</SelectItem>
                      <SelectItem value="ALERT">Alert</SelectItem>
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
                  Post Notice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {notices.map((notice) => (
              <Card
                key={notice._id}
                className="shadow-soft hover:shadow-elevated transition-all border-l-4"
                style={{
                  borderLeftColor:
                    notice.priority === "HIGH"
                      ? "red"
                      : notice.priority === "MEDIUM"
                        ? "orange"
                        : "green",
                }}
              >
                <CardHeader className="flex flex-row justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <CardTitle>{notice.title}</CardTitle>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          notice.type === "ALERT"
                            ? "bg-red-100 text-red-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {notice.type}
                      </span>
                    </div>
                    <CardDescription className="mt-1">
                      {new Date(notice.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(notice._id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground/80">{notice.content}</p>
                  <div className="mt-4 flex items-center text-xs text-muted-foreground gap-4">
                    <span className="flex items-center gap-1">
                      <Megaphone className="w-3 h-3" /> Priority:{" "}
                      {notice.priority}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
            {notices.length === 0 && (
              <p className="text-center text-muted-foreground">
                No notices posted yet.
              </p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Notices;
