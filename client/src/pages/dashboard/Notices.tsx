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
import { Search, Bell, Plus, Trash2, Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Notice } from "@/types";
import { useNotices } from "@/hooks/useQueries";
import { useCreateNotice, useDeleteNotice } from "@/hooks/useMutations";
import { safeParseJSON } from "@/lib/utils";

const Notices = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 10;

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO",
    priority: "MEDIUM",
  });

  const { data, isLoading: loading } = useNotices(page, limit);
  const notices = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const createNoticeMutation = useCreateNotice();
  const deleteNoticeMutation = useDeleteNotice();

  const handleCreate = () => {
    createNoticeMutation.mutate(formData, {
      onSuccess: () => {
        setOpen(false);
        setFormData({
          title: "",
          content: "",
          type: "INFO",
          priority: "MEDIUM",
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteNoticeMutation.mutate(id);
  };

  const filteredNotices = notices.filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Notices & Announcements</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-full sm:w-64 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notices..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
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
                    placeholder=""
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder=""
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                  <div className="flex gap-4">
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
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
        </div>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {filteredNotices.map((notice) => (
              <Card
                key={notice.id}
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
                    onClick={() => handleDelete(notice.id)}
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
            {filteredNotices.length === 0 && (
              <p className="text-center text-muted-foreground">
                No notices found.
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

export default Notices;
