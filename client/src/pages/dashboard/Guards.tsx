import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Trash2 } from "lucide-react";
import { AddGuardModal } from "@/components/dashboard/AddGuardModal";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Guard {
  _id: string;
  name: string;
  email: string;
  contact: string;
}

const Guards = () => {
  const [guards, setGuards] = useState<Guard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchGuards = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/guards");
      if (response.status === 200) {
        setGuards(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch guards",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to connect to server",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuards();
  }, []);

  const deleteGuard = async (id: string) => {
    if (!confirm("Are you sure you want to delete this guard?")) return;

    try {
      const response = await api.delete(`/admin/guards/${id}`);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Guard deleted successfully",
        });
        fetchGuards();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete guard",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    }
  };

  const filteredGuards = guards.filter(
    (guard) =>
      guard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guard.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guard.contact.includes(searchQuery),
  );

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Guards</h1>
            <p className="text-muted-foreground">Manage security guards</p>
          </div>
          <AddGuardModal onGuardAdded={fetchGuards} />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search guards..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="rounded-md border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredGuards.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No guards found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredGuards.map((guard) => (
                  <TableRow key={guard._id}>
                    <TableCell className="font-medium">{guard.name}</TableCell>
                    <TableCell>{guard.contact}</TableCell>
                    <TableCell>{guard.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteGuard(guard._id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Guards;
