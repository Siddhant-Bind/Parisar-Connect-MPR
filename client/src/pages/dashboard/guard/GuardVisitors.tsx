import { useState } from "react";
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
import { useVisitors } from "@/hooks/useQueries";

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
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("active");

  const statusQuery = activeTab === "active" ? "ENTERED,PENDING" : "EXITED";
  const { data: visitorsResponse, refetch } = useVisitors(1, 200, search, statusQuery);
  const visitors = (visitorsResponse?.data || []) as Visitor[];

  const handleExit = async (id: string) => {
    try {
      await api.patch(`/visitors/${id}/exit`);
      toast.success("Visitor marked as exited");
      refetch();
    } catch (error) {
      toast.error("Failed to mark exit");
    }
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
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder=""
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-background border-border"
        />
      </div>

      <Tabs defaultValue="active" onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">
            Active
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Currently Inside</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorTable
                visitors={visitors}
                onExit={handleExit}
                showExitAction
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card className="bg-card">
            <CardHeader>
              <CardTitle>Visitor History</CardTitle>
            </CardHeader>
            <CardContent>
              <VisitorTable visitors={visitors} />
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
      <div className="text-center py-8 text-muted-foreground">No visitors found.</div>
    );
  }

  return (
    <div className="rounded-md border border-border">
      <Table>
        <TableHeader className="bg-muted/50">
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
            <TableRow key={visitor.id} className="hover:bg-muted/50">
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span>{visitor.name}</span>
                  {visitor.documentImage && (
                    <span className="text-[10px] text-blue-500 dark:text-blue-400">
                      Doc Scanned
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                {visitor.wing}-{visitor.flatNumber}
              </TableCell>
              <TableCell>{visitor.purpose}</TableCell>
              <TableCell className="text-muted-foreground">
                {visitor.status === "ENTERED" || visitor.status === "EXITED" ? new Date(visitor.entryTime).toLocaleTimeString() : "—"}
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
