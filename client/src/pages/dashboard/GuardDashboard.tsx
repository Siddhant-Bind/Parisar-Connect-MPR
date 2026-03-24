import { useState, useRef, useCallback, useMemo } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Webcam from "react-webcam";
import { isToday, parseISO } from "date-fns";
import {
  UserPlus,
  Users,
  LogOut as LogOutIcon,
  Clock,
  CheckCircle2,
  Search,
  Phone,
  Building2,
  Camera,
  RefreshCw,
} from "lucide-react";
import { useVisitors } from "@/hooks/useQueries";
import {
  useCreateVisitor,
  useMarkVisitorExit,
  useUploadImage,
  useUpdateVisitorStatus,
} from "@/hooks/useMutations";
import { toast } from "sonner";
import { Visitor } from "@/types";
import { safeParseJSON } from "@/lib/utils";

const GuardDashboard = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    unit: "",
    purpose: "",
  });
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  const webcamRef = useRef<Webcam>(null);

  // Queries & Mutations
  const { data: visitorsResponse, isLoading } = useVisitors(1, 100);
  const createVisitor = useCreateVisitor();
  const markExit = useMarkVisitorExit();
  const uploadImage = useUploadImage();
  const updateStatus = useUpdateVisitorStatus();

  // Filter to only show today's visitors
  const todayVisitors = useMemo(() => {
    const data = visitorsResponse?.data || [];
    return data.filter((v: Visitor) => {
      if (!v.entryTime) return false;
      return isToday(parseISO(v.entryTime));
    });
  }, [visitorsResponse?.data]);

  const filteredVisitors = todayVisitors.filter(
    (v: Visitor) =>
      v.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.wing?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.flatNumber?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const insideCount = todayVisitors.filter(
    (v: Visitor) => v.status === "ENTERED" || v.status === "APPROVED", // Assuming APPROVED might be waiting at gate, but ENTERED is inside
  ).length; // Adjust logic as needed, let's just count ENTERED
  const totalCount = todayVisitors.length;

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
    }
  }, [webcamRef]);

  const handleSubmit = async () => {
    if (!formData.name || !formData.unit || !formData.purpose) {
      return toast.error("Please fill all required fields");
    }

    try {
      let imageUrl = null;
      if (!capturedImage) {
        return toast.error("Please capture a photo of the visitor first");
      }

      let finalImage = capturedImage;

      if (finalImage) {
        toast.info("Uploading image...");
        const res = await uploadImage.mutateAsync({
          image: finalImage,
          folder: "visitors",
        });
        if (res.success) {
          imageUrl = res.data.url;
        }
      }

      // Parse unit into wing and flatNumber (e.g., "A-101")
      const parts = formData.unit.split("-");
      const wing = parts[0] ? parts[0].trim() : "A"; // default fallback
      const flatNumber = parts[1] ? parts[1].trim() : formData.unit;

      await createVisitor.mutateAsync({
        name: formData.name,
        contact: formData.phone,
        wing,
        flatNumber,
        purpose: formData.purpose,
        documentImage: imageUrl,
      });

      // Reset form
      setShowAddForm(false);
      setFormData({ name: "", phone: "", unit: "", purpose: "" });
      setCapturedImage(null);
    } catch (error) {
      console.error("Error creating visitor:", error);
    }
  };

  const user = safeParseJSON(localStorage.getItem("user"), {} as Record<string, any>);

  return (
    <DashboardLayout role="guard" userName={user.name || "Guard"}>
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
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">
                    {
                      todayVisitors.filter(
                        (v: Visitor) => v.status === "ENTERED",
                      ).length
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Visitors Inside
                  </p>
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
                  <p className="text-3xl lg:text-4xl font-bold text-foreground">
                    {totalCount}
                  </p>
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
          {showAddForm ? "Cancel Entry" : "Add New Visitor"}
        </Button>

        {/* Add Visitor Form */}
        {showAddForm && (
          <Card className="rounded-2xl border-0 shadow-card animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-bold">
                New Visitor Entry
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Visitor Name *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Enter visitor name"
                      className="rounded-xl h-12 bg-muted/50 border-0"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Phone Number</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        placeholder="+91..."
                        className="rounded-xl h-12 bg-muted/50 border-0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Visiting Unit *</Label>
                      <Input
                        value={formData.unit}
                        onChange={(e) =>
                          setFormData({ ...formData, unit: e.target.value })
                        }
                        placeholder="e.g. A-101"
                        className="rounded-xl h-12 bg-muted/50 border-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Purpose *</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {["Delivery", "Guest", "Service"].map((purpose) => (
                        <Button
                          key={purpose}
                          variant={
                            formData.purpose === purpose ? "default" : "outline"
                          }
                          className={`rounded-xl h-10 ${
                            formData.purpose === purpose
                              ? "bg-secondary text-secondary-foreground"
                              : "hover:bg-secondary/20 hover:text-secondary-foreground"
                          }`}
                          onClick={() => setFormData({ ...formData, purpose })}
                        >
                          {purpose}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Webcam Section */}
                <div className="space-y-2 flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border rounded-xl p-4">
                  <Label className="mb-2 self-start">Photo Capture</Label>
                  {!capturedImage ? (
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={{ facingMode: "user" }}
                        className="w-full max-w-sm rounded-xl object-cover h-48"
                      />
                      <Button
                        size="icon"
                        className="absolute bottom-2 right-2 rounded-full bg-primary hover:bg-primary/90"
                        onClick={capture}
                        type="button" // Prevent form submission
                      >
                        <Camera className="w-5 h-5 text-primary-foreground" />
                      </Button>
                    </div>
                  ) : (
                    <div className="relative rounded-xl overflow-hidden shadow-sm">
                      <img
                        src={capturedImage}
                        alt="Captured visitor"
                        className="w-full max-w-sm rounded-xl object-cover h-48"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute bottom-2 right-2 rounded-full"
                        onClick={() => setCapturedImage(null)}
                      >
                        <RefreshCw className="w-5 h-5 text-destructive-foreground" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl h-12"
                  onClick={() => setShowAddForm(false)}
                  disabled={createVisitor.isPending || uploadImage.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 rounded-xl h-12 bg-secondary text-secondary-foreground hover:bg-secondary/90"
                  onClick={handleSubmit}
                  disabled={createVisitor.isPending || uploadImage.isPending}
                >
                  {createVisitor.isPending || uploadImage.isPending ? (
                    "Processing..."
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 mr-2" />
                      Add Entry
                    </>
                  )}
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
            {isLoading ? (
              <p className="text-center py-4 text-muted-foreground">
                Loading visitors...
              </p>
            ) : (
              <div className="space-y-3">
                {filteredVisitors.map((visitor: Visitor) => (
                  <div
                    key={visitor.id}
                    className={`p-4 rounded-xl ${
                      visitor.status === "ENTERED"
                        ? "bg-mint-green/30 border border-secondary/30"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex flex-1 items-start gap-4">
                        {/* Visitor Image Thumbnail */}
                        {visitor.documentImage ? (
                          <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden border-2 border-background">
                            <img
                              src={visitor.documentImage}
                              alt={visitor.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="shrink-0 w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-background">
                            <UserPlus className="w-5 h-5 text-secondary" />
                          </div>
                        )}

                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-foreground">
                              {visitor.name}
                            </p>
                            <Badge
                              variant={
                                visitor.status === "ENTERED"
                                  ? "default"
                                  : "secondary"
                              }
                              className={`text-[10px] uppercase rounded-lg ${
                                visitor.status === "ENTERED"
                                  ? "bg-secondary text-secondary-foreground"
                                  : "bg-muted-foreground/20"
                              }`}
                            >
                              {visitor.status}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Building2 className="w-3 h-3" />
                              {visitor.wing + "-" + visitor.flatNumber}
                            </span>
                            {visitor.contact && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {visitor.contact}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {visitor.entryTime
                                ? new Date(
                                    visitor.entryTime,
                                  ).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })
                                : "Recently"}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-primary mt-1">
                            {visitor.purpose || visitor.visitorType || "Guest"}
                          </p>
                        </div>
                      </div>

                      {visitor.status === "APPROVED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={updateStatus.isPending}
                          onClick={() =>
                            updateStatus.mutate({
                              id: visitor.id,
                              status: "ENTERED",
                            })
                          }
                          className="rounded-xl shrink-0 hover:bg-secondary hover:text-secondary-foreground border-secondary text-secondary"
                        >
                          <CheckCircle2 className="w-4 h-4 mr-1" />
                          {updateStatus.isPending
                            ? "Processing..."
                            : "Allow Entry"}
                        </Button>
                      )}

                      {visitor.status === "ENTERED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={markExit.isPending}
                          onClick={() => markExit.mutate(visitor.id)}
                          className="rounded-xl shrink-0 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                        >
                          <LogOutIcon className="w-4 h-4 mr-1" />
                          {markExit.isPending ? "Exiting..." : "Mark Exit"}
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
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default GuardDashboard;
