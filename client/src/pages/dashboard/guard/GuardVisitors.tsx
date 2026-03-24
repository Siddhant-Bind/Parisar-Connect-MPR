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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

export default function GuardVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchVisitors = async () => {
    try {
      setLoading(true);
      const response = await api.get("/visitors");
      setVisitors(response.data.data);
    } catch (error) {
      toast.error("Failed to fetch visitors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleExit = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/exit`); // Assumes route exits, need to check visitor routes
      toast.success("Visitor marked as exited");
      fetchVisitors();
    } catch (error) {
      toast.error("Failed to mark exit");
    }
  };

  // Filter visitors
  const activeVisitors = visitors.filter(
    (v) => v.status === "ENTERED" || v.status === "PENDING",
  );
  const historyVisitors = visitors.filter((v) => v.status === "EXITED");

  const filterBySearch = (list: Visitor[]) => {
    if (!search) return list;
    return list.filter(
      (v) =>
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.flatNumber.includes(search) ||
        v.wing.toLowerCase().includes(search.toLowerCase()),
    );
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Visitor Log</h1>
          <p className="text-muted-foreground">
            Manage visitor entries and exits.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active ({activeVisitors.length})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card>
            <CardHeader>
              <CardTitle>Currently Inside</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorTable
                visitors={filterBySearch(activeVisitors)}
                onExit={handleExit}
                showExitAction
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Visitor History</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorTable visitors={filterBySearch(historyVisitors)} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VisitorTable({
  visitors,
  onExit,
  showExitAction,
}: {
  visitors: Visitor[];
  onExit?: (id: string) => void;
  showExitAction?: boolean;
}) {
  if (visitors.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">No visitors found.</div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Flat</TableHead>
            <TableHead>Purpose</TableHead>
            <TableHead>Entry Time</TableHead>
            {showExitAction ? (
              <TableHead>Action</TableHead>
            ) : (
              <TableHead>Exit Time</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitors.map((visitor) => (
            <TableRow key={visitor.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{visitor.name}</span>
                  {visitor.documentImage && (
                    <span className="text-[10px] text-blue-500">
                      Doc Scanned
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {visitor.wing}-{visitor.flatNumber}
              </TableCell>
              <TableCell>{visitor.purpose}</TableCell>
              <TableCell>
                {new Date(visitor.entryTime).toLocaleTimeString()}
              </TableCell>
              <TableCell>
                {showExitAction && onExit ? (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onExit(visitor.id)}
                  >
                    <LogOut className="h-4 w-4 mr-1" /> Mark Exit
                  </Button>
                ) : visitor.exitTime ? (
                  new Date(visitor.exitTime).toLocaleTimeString()
                ) : (
                  "-"
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
