import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Loader2, Megaphone } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";

interface Notice {
  _id: string;
  title: string;
  content: string;
  type: "INFO" | "EVENT" | "ALERT";
  priority: "LOW" | "MEDIUM" | "HIGH";
  createdAt: string;
}

const ResidentNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get("/notices");
      if (res.data.success) setNotices(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch notices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Notices & Announcements</h1>

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

export default ResidentNotices;
