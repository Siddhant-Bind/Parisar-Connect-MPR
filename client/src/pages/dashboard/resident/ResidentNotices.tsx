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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Loader2, Megaphone, Filter } from "lucide-react";
import { toast } from "sonner";
import { Notice } from "@/types";
import { useNotices } from "@/hooks/useQueries";
import { useAuth } from "@/context/AuthProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo } from "react";

const ResidentNotices = () => {
  const { data, isLoading: loading } = useNotices(1, 100);
  const notices = data?.data || [];

  const { user } = useAuth();
  
  const [filterType, setFilterType] = useState<string>("ALL");
  const [filterSociety, setFilterSociety] = useState<string>("ALL");

  const uniqueSocieties = useMemo(() => {
    const list = new Map();
    notices.forEach((n: Notice) => {
      if (n.societyId && n.society?.name) {
        list.set(n.societyId, n.society.name);
      }
    });
    return Array.from(list.entries()).map(([id, name]) => ({ id, name }));
  }, [notices]);

  const filteredNotices = useMemo(() => {
    return notices.filter((n: Notice) => {
      const typeMatch = filterType === "ALL" || n.type === filterType;
      const societyMatch = filterSociety === "ALL" || n.societyId === filterSociety;
      return typeMatch && societyMatch;
    });
  }, [notices, filterType, filterSociety]);

  return (
    <DashboardLayout role="resident" userName={user?.name || "Resident"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-3xl font-bold">Notices & Announcements</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="EVENT">Event</SelectItem>
                <SelectItem value="ALERT">Alert</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterSociety} onValueChange={setFilterSociety}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Society" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Societies</SelectItem>
                {uniqueSocieties.map((soc) => (
                  <SelectItem key={soc.id} value={soc.id}>{soc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {filteredNotices.map((notice: Notice) => (
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
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle>{notice.title}</CardTitle>
                    <span
                      className={`text-xs px-2 py-1 rounded-full font-medium ${
                        notice.type === "ALERT"
                          ? "bg-red-100 text-red-700"
                          : notice.type === "EVENT"
                          ? "bg-purple-100 text-purple-700 border border-purple-200"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {notice.type}
                    </span>
                    {notice.societyId !== user.societyId && notice.society?.name && (
                      <span className="text-xs px-2 py-1 rounded-full font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        {notice.society.name}
                      </span>
                    )}
                  </div>
                  <CardDescription>
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </CardDescription>
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
                    <div className="flex items-center gap-3">
                      {notice.type === "EVENT" && notice.eventLink && (
                        <Button 
                          size="sm" 
                          variant="default"
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-md px-4"
                          onClick={() => window.open(notice.eventLink, "_blank")}
                        >
                          Register
                        </Button>
                      )}
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
                          {notice.type === "EVENT" && notice.eventLink && (
                            <div className="mt-4 flex justify-end gap-2 border-t pt-4">
                              <Button 
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={() => window.open(notice.eventLink, "_blank")}
                              >
                                Register Now
                              </Button>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
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
      </div>
    </DashboardLayout>
  );
};

export default ResidentNotices;
