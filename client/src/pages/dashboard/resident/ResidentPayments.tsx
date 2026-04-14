import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { usePayments } from "@/hooks/useQueries";
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/context/AuthProvider";

const ResidentPayments = () => {
  const [page, setPage] = useState(1);
  const [payingId, setPayingId] = useState<string | null>(null);
  const limit = 10;

  const { data, isLoading: loading } = usePayments(page, limit);
  const payments = data?.data || [];
  const totalPages = data?.totalPages || 1;

  const handlePay = (id: string) => {
    if (payingId) return; // Already processing
    setPayingId(id);
    toast.info("Redirecting to Payment Gateway...");
    // Lock the button for 3 seconds to prevent duplicate clicks
    setTimeout(() => setPayingId(null), 3000);
  };

  const { user } = useAuth();

  return (
    <DashboardLayout role="resident" userName={user.name || "Resident"}>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">My Payments &amp; Dues</h1>

        <Card className="shadow-soft border-0">
          <CardHeader>
            <CardTitle>Maintenance &amp; Bill History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="animate-spin mx-auto" />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
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
                    <TableRow key={payment.id}>
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
                            className="bg-gradient-warm text-white shadow-button text-xs sm:text-sm px-2 sm:px-3"
                            onClick={() => handlePay(payment.id)}
                            disabled={payingId === payment.id}
                          >
                            {payingId === payment.id ? (
                              <Loader2 className="w-4 h-4 mr-1 sm:mr-2 animate-spin" />
                            ) : (
                              <CreditCard className="w-4 h-4 mr-1 sm:mr-2" />
                            )}
                            <span className="hidden sm:inline">Pay Now</span>
                            <span className="sm:hidden">Pay</span>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {payments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  )}
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

export default ResidentPayments;
