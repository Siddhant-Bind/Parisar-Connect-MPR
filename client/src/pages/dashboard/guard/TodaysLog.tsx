import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface Visitor {
  id: string;
  name: string;
  wing: string;
  flatNumber: string;
  purpose: string;
  entryTime: string;
  exitTime?: string;
  status: "ENTERED" | "EXITED" | "PENDING";
  documentImage?: string;
}

export default function TodaysLog() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      // Filter for today's visitors (ENTERED or EXITED today)
      // Ideally backend filters, but doing frontend filter for now as per previous pattern
      const today = new Date().toDateString();
      const todaysVisitors = response.data.data.filter((v: Visitor) => {
        const entryDate = new Date(v.entryTime).toDateString();
        const exitDate = v.exitTime
          ? new Date(v.exitTime).toDateString()
          : null;
        return entryDate === today || exitDate === today;
      });
      setVisitors(todaysVisitors);
    } catch (error) {
      toast.error("Failed to fetch today's logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleExit = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/exit`);
      toast.success("Visitor marked as exited");
      fetchVisitors();
    } catch (error) {
      toast.error("Failed to mark exit");
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
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
          Today's Log
        </h1>
        <p className="text-muted-foreground text-lg">
          Live monitoring of visitor entries and exits.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, unit, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-emerald-500 focus:ring-emerald-500 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="h-9 px-4 rounded-lg bg-emerald-50 text-emerald-700 border-emerald-200"
          >
            {filteredVisitors.filter((v) => v.status === "ENTERED").length}{" "}
            Active
          </Badge>
          <Badge
            variant="outline"
            className="h-9 px-4 rounded-lg bg-gray-50 text-gray-700 border-gray-200"
          >
            {filteredVisitors.length} Total
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
                    Entry
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Exit
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
                    className="hover:bg-emerald-50/30 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span className="font-semibold">{visitor.name}</span>
                        {visitor.documentImage && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-blue-100 text-blue-600 font-medium">
                              Scan
                            </span>
                          </div>
                        )}
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        {visitor.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600 font-medium">
                      {new Date(visitor.entryTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {visitor.exitTime
                        ? new Date(visitor.exitTime).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      {visitor.status === "ENTERED" ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 shadow-sm"
                          onClick={() => handleExit(visitor.id)}
                        >
                          <LogOut className="h-4 w-4 mr-1" /> Mark Exit
                        </Button>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="bg-gray-100 text-gray-500"
                        >
                          Exited
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {filteredVisitors.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-2">
                          <LogOut className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium">No logs for today yet.</p>
                        <p className="text-sm">New entries will appear here.</p>
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
