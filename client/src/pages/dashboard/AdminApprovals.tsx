import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";

interface PendingAdmin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

const AdminApprovals = () => {
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);

  // Check if current user is Creator (we can infer this if they are approved and role is ADMIN)
  // Actually, better to just let the backend decide if they have access.
  // If backend returns 403, we can show a "Not Authorized" message.
  const [isCreator, setIsCreator] = useState(true);

  useEffect(() => {
    fetchPendingAdmins();
  }, []);

  const fetchPendingAdmins = async () => {
    try {
      const { data } = await api.get("/societies/admins/pending");
      if (data.success) {
        setPendingAdmins(data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsCreator(false);
      } else {
        toast.error("Failed to fetch pending approvals");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    setApprovingId(id);
    try {
      const { data } = await api.patch(`/societies/admins/${id}/approve`);
      if (data.success) {
        toast.success("Admin approved successfully");
        setPendingAdmins((prev) => prev.filter((admin) => admin.id !== id));
      }
    } catch (error) {
      toast.error("Failed to approve admin. Please try again.");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-1">
            Admin Approvals
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Manage join requests from other admins
          </p>
        </div>

        {!isCreator ? (
          <Card className="rounded-2xl border-0 shadow-card bg-destructive/10">
            <CardContent className="p-6 text-center text-destructive">
              <h3 className="font-semibold text-lg mb-2">Access Denied</h3>
              <p>Only the Society Creator can manage admin approvals.</p>
            </CardContent>
          </Card>
        ) : loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : pendingAdmins.length === 0 ? (
          <Card className="rounded-2xl border-0 shadow-card bg-card/50">
            <CardContent className="p-12 text-center text-muted-foreground">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 opacity-20 text-green-500" />
              <p className="text-lg font-medium">No pending requests</p>
              <p className="text-sm">You're all caught up!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendingAdmins.map((admin) => (
              <Card
                key={admin.id}
                className="rounded-2xl border-0 shadow-soft hover:shadow-elevated transition-shadow"
              >
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{admin.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Email
                    </p>
                    <p className="text-sm">{admin.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Requested on
                    </p>
                    <p className="text-sm">
                      {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    className="w-full bg-gradient-warm hover:opacity-90 transition-opacity rounded-xl"
                    onClick={() => handleApprove(admin.id)}
                    disabled={approvingId === admin.id}
                  >
                    {approvingId === admin.id ? "Approving..." : "Approve Request"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminApprovals;
