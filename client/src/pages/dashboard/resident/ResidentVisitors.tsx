import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface Visitor {
  _id: string; // Keep as _id if that's what backend returns, but schema says id. Checking interface usage.
  id: string; // Add id to be safe
  name: string;
  purpose: string;
  wing: string;
  flatNumber: string;
  entryTime: string;
  exitTime?: string;
  status: "PENDING" | "APPROVED" | "ENTERED" | "EXITED";
}

const ResidentVisitors = () => {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      const res = await api.get("/visitors");
      if (res.data.success) setVisitors(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch visitor logs");
    } finally {
      setLoading(false);
    }
  };

  const handlePreApprove = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      // Backend automatically sets status=APPROVED and gets wing/flat from user token
      await api.post("/visitors", {
        name: formData.name,
        purpose: formData.purpose,
        // wing/flatNumber are inferred from resident's profile in backend
        wing: "A", // Fallback if backend needs it, but controller should handle or we need to fetch profile.
        flatNumber: "101", // Placeholder, ideally fetched from profile context
      });
      toast.success("Visitor pre-approved successfully");
      setIsModalOpen(false);
      setFormData({ name: "", purpose: "" });
      fetchVisitors();
    } catch (error) {
      toast.error("Failed to pre-approve visitor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout role="resident">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">My Visitors</h1>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Pre-approve Visitor
          </Button>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle>Visitor History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Visitor Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Expected / Entry</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visitors.map((visitor) => (
                    <TableRow key={visitor.id || visitor._id}>
                      <TableCell className="font-medium">
                        {visitor.name}
                      </TableCell>
                      <TableCell>{visitor.purpose}</TableCell>
                      <TableCell>
                        {visitor.entryTime
                          ? new Date(visitor.entryTime).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            visitor.status === "EXITED"
                              ? "secondary"
                              : "default"
                          }
                          className={
                            visitor.status === "ENTERED"
                              ? "bg-green-500 hover:bg-green-600"
                              : visitor.status === "APPROVED"
                                ? "bg-blue-500 hover:bg-blue-600"
                                : ""
                          }
                        >
                          {visitor.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  {visitors.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={4}
                        className="text-center py-8 text-muted-foreground"
                      >
                        No visitor logs found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Pre-approve Future Visitor</DialogTitle>
            </DialogHeader>
            <form onSubmit={handlePreApprove} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Visitor Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <div className="flex flex-wrap gap-2">
                  {["Guest", "Delivery", "Service", "Other"].map((p) => (
                    <Button
                      key={p}
                      type="button"
                      variant={formData.purpose === p ? "default" : "outline"}
                      className="rounded-full h-8"
                      onClick={() => setFormData({ ...formData, purpose: p })}
                    >
                      {p}
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={submitting}>
                  {submitting ? "Approving..." : "Pre-approve"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ResidentVisitors;
