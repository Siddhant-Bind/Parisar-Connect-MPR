import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
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
import { Search } from "lucide-react";
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

export default function VisitorHistory() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      setVisitors(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch visitor history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const filteredVisitors = visitors.filter(
    (v) =>
      v.name.toLowerCase().includes(search.toLowerCase()) ||
      v.flatNumber.includes(search) ||
      v.wing.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-7xl">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Visitor History
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete archive of all visitor logs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search by name, unit, or purpose..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 h-12 bg-white shadow-sm border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Badge
            variant="outline"
            className="h-9 px-4 rounded-lg bg-purple-50 text-purple-700 border-purple-200"
          >
            {filteredVisitors.length} Records
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
                    Entry Date & Time
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600">
                    Exit Time
                  </TableHead>
                  <TableHead className="font-semibold text-gray-600 text-right">
                    Status
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredVisitors.map((visitor) => (
                  <TableRow
                    key={visitor.id}
                    className="hover:bg-purple-50/30 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{visitor.name}</span>
                        {visitor.documentImage && (
                          <span className="text-[10px] text-blue-500 font-medium">
                            Scan Available
                          </span>
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
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {visitor.purpose}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-600">
                      {new Date(visitor.entryTime).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-500">
                      {visitor.exitTime
                        ? new Date(visitor.exitTime).toLocaleTimeString()
                        : "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge
                        variant={
                          visitor.status === "ENTERED" ? "default" : "secondary"
                        }
                        className={
                          visitor.status === "ENTERED"
                            ? "bg-emerald-600 hover:bg-emerald-700"
                            : ""
                        }
                      >
                        {visitor.status}
                      </Badge>
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
                          <Search className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="font-medium">No history records found.</p>
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
