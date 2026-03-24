import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

// Shared Visitor Interface - ideally move to a types file
interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  entryTime: string; // Expected time for pre-approved
  status: "PENDING" | "APPROVED" | "ENTERED" | "EXITED";
}

export default function PreApprovedVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      // Filter for APPROVED status
      const approved = response.data.data.filter(
        (v: Visitor) => v.status === "APPROVED",
      );
      setVisitors(approved);
    } catch (error) {
      toast.error("Failed to fetch pre-approved visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleCheckIn = async (id: string) => {
    try {
      // We can reuse the update endpoint or create a specific one.
      // For now assuming we patch status to ENTERED.
      // We might need to update entryTime to NOW.
      await api.patch(`/visitors/${id}/entry`); // Need to ensure this route exists or use a generic update
      toast.success("Visitor checked in successfully");
      fetchVisitors();
    } catch (error) {
      // Fallback if specific entry route doesn't exist, try generic update if available,
      // or just mock it for now if backend isn't ready for this specific transition
      toast.error("Failed to check in visitor");
    }
  };

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNumber.includes(search) ||
      v.wing.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          Pre-approved Visitors
        </h1>
        <p className="text-muted-foreground text-lg">
          Expected arrivals approved by residents.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder=""
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="h-9 px-4 rounded-lg bg-blue-50 text-blue-700 border-blue-200"
          >
            {filteredVisitors.length} Expected
          </Badge>
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="rounded-xl overflow-hidden border border-gray-100">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-semibold text-gray-600">
                    Visitor Name
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Unit
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Purpose
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Expected
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow
                    key={visitor.id}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                          {visitor.name.charAt(0)}
                        </div>
                        {visitor.name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className="font-mono text-xs bg-gray-100 text-gray-700"
                      >
                        {visitor.wing}-{visitor.flatNumber}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {visitor.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {new Date(visitor.entryTime).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-md rounded-lg transition-all"
                        onClick={() => handleCheckIn(visitor.id)}
                      >
                        <Check className="h-4 w-4 mr-1" /> Check In
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVisitors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium">
                          No pre-approved visitors found.
                        </p>
                        <p className="text-sm">
                          They will appear here when residents approve them.
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
