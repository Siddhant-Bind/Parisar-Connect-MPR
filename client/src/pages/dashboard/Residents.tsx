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
import { AddResidentModal } from "@/components/dashboard/AddResidentModal";
import { toast } from "@/hooks/use-toast";
import api from "@/lib/api";

interface Resident {
  _id: string;
  name: string;
  email: string;
  contact: string;
  wing: string;
  flatNumber: string;
}

const Residents = () => {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchResidents = async () => {
    setIsLoading(true);
    try {
      const response = await api.get("/admin/residents");
      if (response.status === 200) {
        setResidents(response.data.data);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch residents",
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
    fetchResidents();
  }, []);

  const deleteResident = async (id: string) => {
    if (!confirm("Are you sure you want to delete this resident?")) return;

    try {
      const response = await api.delete(`/admin/residents/${id}`);

      if (response.status === 200) {
        toast({
          title: "Success",
          description: "Resident deleted successfully",
        });
        fetchResidents();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete resident",
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

  const filteredResidents = residents.filter(
    (resident) =>
      resident.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.flatNumber.includes(searchQuery),
  );

  return (
    <DashboardLayout role="admin" userName="Admin User">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Residents</h1>
            <p className="text-muted-foreground">Manage colony residents</p>
          </div>
          <AddResidentModal onResidentAdded={fetchResidents} />
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search residents..."
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
                <TableHead>Unit</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : filteredResidents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No residents found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredResidents.map((resident) => (
                  <TableRow key={resident._id}>
                    <TableCell className="font-medium">
                      {resident.name}
                    </TableCell>
                    <TableCell>
                      {resident.wing}-{resident.flatNumber}
                    </TableCell>
                    <TableCell>{resident.contact}</TableCell>
                    <TableCell>{resident.email}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteResident(resident._id)}
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

export default Residents;
