import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
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
import { Visitor } from "@/types";
import { useVisitors } from "@/hooks/useQueries";
import { useCreateVisitor } from "@/hooks/useMutations";
import { useAuth } from "@/context/AuthProvider";

const ResidentVisitors = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "Guest",
  });

  const { user } = useAuth();
  const { data, isLoading: loading } = useVisitors(1, 100);
  const visitors = data?.data || [];
  const createVisitorMutation = useCreateVisitor();

  const handlePreApprove = (e: React.FormEvent) => {
    e.preventDefault();
    createVisitorMutation.mutate(
      {
        name: formData.name,
        purpose: formData.purpose,
        wing: user?.wing || "A",
        flatNumber: user?.flatNumber || "101",
      },
      {
        onSuccess: () => {
          setIsModalOpen(false);
          setFormData({ name: "", purpose: "" });
        },
      },
    );
  };

  return (
    <DashboardLayout role="resident" userName={user?.name || "Resident"}>
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
                    <TableRow key={visitor.id || visitor.id}>
                      <TableCell className="font-medium">
                        {visitor.name}
                      </TableCell>
                      <TableCell>{visitor.purpose}</TableCell>
                      <TableCell>
                        {visitor.status === "ENTERED" || visitor.status === "EXITED"
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
                  placeholder="Enter your name"
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
                <Button
                  type="submit"
                  disabled={createVisitorMutation.isPending}
                >
                  {createVisitorMutation.isPending
                    ? "Approving..."
                    : "Pre-approve"}
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
