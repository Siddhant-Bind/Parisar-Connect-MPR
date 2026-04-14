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
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import { Notice } from "@/types";
import { useNotices } from "@/hooks/useQueries";
import { useAuth } from "@/context/AuthProvider";

const ResidentNotices = () => {
  const { data, isLoading: loading } = useNotices(1, 100);
  const notices = data?.data || [];

  const { user } = useAuth();
  return (
    <DashboardLayout role="resident" userName={user?.name || "Resident"}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Notices & Announcements</h1>

        {loading ? (
          <Loader2 className="animate-spin mx-auto" />
        ) : (
          <div className="grid gap-4">
            {notices.map((notice) => (
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
                      className={`text-xs px-2 py-1 rounded-full ${
                        notice.type === "ALERT"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {notice.type}
                    </span>
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

export default ResidentNotices;
