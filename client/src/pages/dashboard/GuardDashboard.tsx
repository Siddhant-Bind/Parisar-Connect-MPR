import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  UserPlus, 
  Users, 
  LogOut as LogOutIcon,
  Clock,
  CheckCircle2,
  Search,
  Phone,
  Building2
} from "lucide-react";

// Demo data
const todayVisitors = [
  { id: 1, name: "Rahul Sharma", phone: "98765-43210", unit: "A-101", purpose: "Delivery", time: "10:30 AM", status: "inside" },
  { id: 2, name: "Priya Patel", phone: "98765-43211", unit: "B-304", purpose: "Guest", time: "11:15 AM", status: "inside" },
  { id: 3, name: "Courier - Flipkart", phone: "98765-43212", unit: "C-201", purpose: "Delivery", time: "9:00 AM", status: "exited" },
  { id: 4, name: "AC Technician", phone: "98765-43213", unit: "A-205", purpose: "Service", time: "8:30 AM", status: "exited" },
];

const GuardDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredVisitors = todayVisitors.filter(
    (v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           v.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const insideCount = todayVisitors.filter((v) => v.status === "inside").length;
  const totalCount = todayVisitors.length;

  return (
    <DashboardLayout role="guard" userName="Suresh Kumar">
      <div className="space-y-6 pb-20 lg:pb-0">
        {/* Header Stats */}
        <div className="grid grid-cols-2 gap-4 animate-fade-in-up">
          <Card className="rounded-2xl border-0 shadow-card bg-mint-green/50">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
                  <Users className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">{insideCount}</p>
                  <p className="text-sm text-muted-foreground">Visitors Inside</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-card bg-light-yellow/50">
            <CardContent className="p-4 lg:p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-warm-orange/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warm-orange" />
                </div>
                <div>
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">{totalCount}</p>
                  <p className="text-sm text-muted-foreground">Total Today</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Add Visitor Button */}
        <Button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full h-14 rounded-2xl bg-gradient-warm text-primary-foreground shadow-button btn-press text-lg font-bold animate-fade-in-delay-1"
        >
          <UserPlus className="w-6 h-6 mr-3" />
          Add New Visitor
        </Button>

        {/* Add Visitor Form */}
        {showAddForm && (
          <Card className="rounded-2xl border-0 shadow-card animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">New Visitor Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label>Visitor Name</Label>
                  <Input 
                    placeholder="Enter name" 
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input 
                    placeholder="98765-43210" 
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visiting Unit</Label>
                  <Input 
                    placeholder="A-101" 
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Purpose</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {["Delivery", "Guest", "Service"].map((purpose) => (
                      <Button 
                        key={purpose}
                        variant="outline" 
                        className="rounded-xl h-10 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary"
                      >
                        {purpose}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl h-12"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1 rounded-xl h-12 bg-secondary text-secondary-foreground"
                  onClick={() => setShowAddForm(false)}
                >
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Add Entry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Today's Visitors */}
        <Card className="rounded-2xl border-0 shadow-card animate-fade-in-delay-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                Today's Visitors
              </CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search visitors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 rounded-xl h-10 bg-muted/50 border-0 w-full sm:w-60"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredVisitors.map((visitor) => (
                <div 
                  key={visitor.id}
                  className={`p-4 rounded-xl ${
                    visitor.status === "inside" ? "bg-mint-green/30 border border-secondary/30" : "bg-muted/50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-foreground">{visitor.name}</p>
                        <Badge 
                          variant={visitor.status === "inside" ? "default" : "secondary"}
                          className={`text-xs rounded-lg ${
                            visitor.status === "inside" 
                              ? "bg-secondary text-secondary-foreground" 
                              : "bg-muted-foreground/20"
                          }`}
                        >
                          {visitor.status === "inside" ? "Inside" : "Exited"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {visitor.unit}
                        </span>
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {visitor.phone}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {visitor.time}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{visitor.purpose}</p>
                    </div>
                    {visitor.status === "inside" && (
                      <Button 
                        size="sm"
                        variant="outline"
                        className="rounded-xl shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                      >
                        <LogOutIcon className="w-4 h-4 mr-1" />
                        Mark Exit
                      </Button>
                    )}
                  </div>
                </div>
              ))}

              {filteredVisitors.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No visitors found</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuardDashboard;
