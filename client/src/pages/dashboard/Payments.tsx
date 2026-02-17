import { useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Check } from "lucide-react";
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

interface Payment {
  _id: string;
  type: string;
  month: string;
  amount: number;
  dueDate: string;
  status: "PENDING" | "PAID" | "OVERDUE";
  resident?: {
    name: string;
    flatNumber: string;
    wing: string;
  };
}

interface Resident {
  _id: string;
  name: string;
  flatNumber: string;
  wing: string;
}

const Payments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]); // To select resident for payment req
  const [formData, setFormData] = useState({
    residentId: "",
    amount: "",
    type: "MAINTENANCE",
    month: "",
    dueDate: "",
  });

  useEffect(() => {
    fetchPayments();
    fetchResidents();
  }, []);

  const fetchPayments = async () => {
    try {
      const res = await api.get("/admin/payments");
      if (res.data.success) setPayments(res.data.data);
    } catch (error) {
      toast.error("Failed to fetch payments");
    } finally {
      setLoading(false);
    }
  };

  const fetchResidents = async () => {
    try {
      // This still uses the user router as it's a general lookup, or control via admin/residents if preferred
      const res = await api.get("/users/residents");
      if (res.data.success) setResidents(res.data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await api.post("/admin/payments", formData);
      if (res.data.success) {
        toast.success("Payment request created");
        setOpen(false);
        fetchPayments();
      }
    } catch (error) {
      toast.error("Failed to create request");
    }
  };

  const markPaid = async (id: string) => {
    try {
      const res = await api.patch(`/payments/${id}/pay`, {
        paymentMethod: "CASH", // Simulating cash payment by admin for now
      });
      if (res.data.success) {
        toast.success("Marked as Paid");
        setPayments(
          payments.map((p) => (p._id === id ? { ...p, status: "PAID" } : p)),
        );
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Payments & Dues</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl shadow-button btn-press bg-gradient-warm text-white">
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
                    {residents.map((r) => (
                      <SelectItem key={r._id} value={r._id}>
                        {r.name} ({r.wing}-{r.flatNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Amount"
                  type="number"
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                />
                <Input
                  placeholder="Month (e.g. Jan 2024)"
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
                  {payments.map((payment) => (
                    <TableRow key={payment._id}>
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
                            onClick={() => markPaid(payment._id)}
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
      </div>
    </DashboardLayout>
  );
};

export default Payments;
