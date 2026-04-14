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

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

import { Notice } from "@/types";
import { useNotices, useSocieties } from "@/hooks/useQueries";
import { useCreateNotice, useDeleteNotice } from "@/hooks/useMutations";
import { useAuth } from "@/context/AuthProvider";

const Notices = () => {
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

  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "INFO",
    priority: "MEDIUM",
    visibility: "PRIVATE",
    eventLink: "",
    targetSocieties: [] as string[],
  });

  const { data, isLoading: loading } = useNotices(page, limit, debouncedSearch);
  const { data: societies } = useSocieties();
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
          visibility: "PRIVATE",
          eventLink: "",
          targetSocieties: [],
        });
      },
    });
  };

  const handleDelete = (id: string) => {
    deleteNoticeMutation.mutate(id);
  };

  const filteredNotices = notices;

  const { user } = useAuth();

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
                    placeholder="Notice Title..."
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                  />
                  <Textarea
                    placeholder="Enter full notice content here..."
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                  />
                  <div className="flex gap-4 w-full">
                    <Select
                      value={formData.type}
                      onValueChange={(v) =>
                        setFormData({ ...formData, type: v })
                      }
                    >
                      <SelectTrigger className="flex-1">
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
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LOW">Low</SelectItem>
                        <SelectItem value="MEDIUM">Medium</SelectItem>
                        <SelectItem value="HIGH">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.type === "EVENT" && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                      <Input
                        placeholder="Event Registration Link (URL)"
                        type="url"
                        value={formData.eventLink}
                        onChange={(e) =>
                          setFormData({ ...formData, eventLink: e.target.value })
                        }
                      />
                      <Select
                        value={formData.visibility}
                        onValueChange={(v) =>
                          setFormData({ ...formData, visibility: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Visibility" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PRIVATE">Private (Only this Society)</SelectItem>
                          <SelectItem value="PUBLIC">Public (Cross-Society)</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      {formData.visibility === "PUBLIC" && (
                        <div className="space-y-2 border rounded-md p-3">
                          <span className="text-sm font-medium">Target Societies</span>
                          <p className="text-xs text-muted-foreground">Select societies where this event should be visible.</p>
                          <ScrollArea className="h-32 border rounded-md p-2">
                            {societies?.filter(s => s.id !== user.societyId).map((society) => (
                              <div key={society.id} className="flex items-center space-x-2 py-1.5">
                                <Checkbox 
                                  id={society.id} 
                                  checked={formData.targetSocieties.includes(society.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setFormData(prev => ({...prev, targetSocieties: [...prev.targetSocieties, society.id]}));
                                    } else {
                                      setFormData(prev => ({...prev, targetSocieties: prev.targetSocieties.filter(id => id !== society.id)}));
                                    }
                                  }}
                                />
                                <label
                                  htmlFor={society.id}
                                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {society.name}
                                </label>
                              </div>
                            ))}
                            {(!societies || societies.filter(s => s.id !== user.societyId).length === 0) && (
                              <p className="text-xs text-muted-foreground p-2">No other active societies available.</p>
                            )}
                          </ScrollArea>
                        </div>
                      )}
                    </div>
                  )}

                  <Button
                    onClick={handleCreate}
                    disabled={createNoticeMutation.isPending}
                    className="w-full bg-gradient-warm text-white"
                  >
                    {createNoticeMutation.isPending ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Posting...</>
                    ) : (
                      "Post Notice"
                    )}
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
                  <p className="text-foreground/80 whitespace-pre-wrap text-sm line-clamp-3">
                    {notice.content.length > 150 ? `${notice.content.substring(0, 150)}...` : notice.content}
                  </p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground gap-4">
                    <span className="flex items-center gap-1">
                      <Megaphone className="w-3 h-3" /> Priority:{" "}
                      {notice.priority}
                    </span>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary font-semibold">View</Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{notice.title}</DialogTitle>
                        </DialogHeader>
                        <div className="mt-4 whitespace-pre-wrap text-sm text-foreground/90 max-h-[60vh] overflow-y-auto">
                          {notice.content}
                        </div>
                      </DialogContent>
                    </Dialog>
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
