import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check, Search } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { usePayments } from "@/hooks/useQueries";
import {
  useCreatePaymentRequest,
  useMarkPaymentPaid,
} from "@/hooks/useMutations";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment, User as Resident } from "@/types";
import { safeParseJSON } from "@/lib/utils";
const Payments = () => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [residents, setResidents] = useState<Resident[]>([]); // To select resident for payment req
  const [page, setPage] = useState(1);
  const limit = 10;

  const { data, isLoading: loading } = usePayments(page, limit);
  const payments = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const createPaymentMutation = useCreatePaymentRequest();
  const markPaidMutation = useMarkPaymentPaid();

  const [formData, setFormData] = useState({
    type: "Maintenance",
    month: new Date().toLocaleString("default", { month: "long" }),
    amount: "",
    dueDate: "",
    residentId: "", // "ALL" for bulk, or specific resident ID
  });

  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    try {
      const res = await api.get("/residents");
      if (res.data.success) setResidents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = () => {
    createPaymentMutation.mutate(formData, {
      onSuccess: () => setOpen(false),
    });
  };

  const markPaid = (id: string) => {
    markPaidMutation.mutate(id);
  };

  const filteredPayments = payments.filter((p) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      p.resident?.name?.toLowerCase().includes(searchLower) ||
      p.resident?.flatNumber?.toLowerCase().includes(searchLower) ||
      p.type?.toLowerCase().includes(searchLower) ||
      p.month?.toLowerCase().includes(searchLower)
    );
  });

  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);

  return (
    <DashboardLayout role="admin" userName={user.name || "Admin"}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold">Payments & Dues</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-button btn-press bg-gradient-warm text-white whitespace-nowrap">
                  <CreditCard className="w-4 h-4 mr-2" /> Request Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Valid Payment Request</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select
                    onValueChange={(v) =>
                      setFormData({ ...formData, residentId: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Resident" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem
                        value="bulk"
                        className="font-semibold text-primary"
                      >
                        All Residents (Bulk)
                      </SelectItem>
                      {residents.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          {r.name} ({r.wing}-{r.flatNumber})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder=""
                    type="number"
                    onChange={(e) =>
                      setFormData({ ...formData, amount: e.target.value })
                    }
                  />
                  <Input
                    placeholder=""
                    onChange={(e) =>
                      setFormData({ ...formData, month: e.target.value })
                    }
                  />
                  <Input
                    type="date"
                    onChange={(e) =>
                      setFormData({ ...formData, dueDate: e.target.value })
                    }
                  />
                  <Button onClick={handleCreate} className="w-full">
                    Create Request
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle>Payment Records</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Resident</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Month</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {payment.resident?.name} ({payment.resident?.flatNumber}
                        )
                      </TableCell>
                      <TableCell>{payment.type}</TableCell>
                      <TableCell>{payment.month}</TableCell>
                      <TableCell className="font-bold">
                        ₹{payment.amount}
                      </TableCell>
                      <TableCell>
                        {new Date(payment.dueDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            payment.status === "PAID"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }
                        >
                          {payment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {payment.status === "PENDING" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700"
                            onClick={() => markPaid(payment.id)}
                          >
                            <Check className="w-4 h-4 mr-1" /> Mark Paid
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

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

export default Payments;
