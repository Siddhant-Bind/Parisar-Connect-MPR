import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  ChevronLeft,
  X,
  Upload,
  Car,
  User,
  Package,
  Wrench,
  CheckCircle2,
  Shield,
  MoreHorizontal,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthProvider";
import { Card, CardContent } from "@/components/ui/card";
import { AxiosError } from "axios";
import DashboardLayout from "@/components/dashboard/DashboardLayout";

const VISITOR_TYPES = [
  {
    id: "Guest",
    label: "Guest",
    icon: User,
    color: "border-blue-300 bg-blue-50 text-blue-700",
    selectedColor:
      "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-200",
  },
  {
    id: "Delivery",
    label: "Delivery",
    icon: Package,
    color: "border-orange-300 bg-orange-50 text-orange-700",
    selectedColor:
      "border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200",
  },
  {
    id: "Staff",
    label: "Staff / Service",
    icon: Wrench,
    color: "border-purple-300 bg-purple-50 text-purple-700",
    selectedColor:
      "border-purple-500 bg-purple-500 text-white shadow-lg shadow-purple-200",
  },
  {
    id: "Other",
    label: "Other",
    icon: MoreHorizontal,
    color: "border-gray-300 bg-gray-50 text-gray-700",
    selectedColor:
      "border-gray-600 bg-gray-700 text-white shadow-lg shadow-gray-200",
  },
];

export default function AddVisitorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    wing: "",
    flatNumber: "",
    contact: "",
    visitorType: "Guest",
    vehicleNumber: "",
  });
  const [otherVisitorType, setOtherVisitorType] = useState("");
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const setField = (key: string, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Document image is too large. Maximum 5MB allowed.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setDocumentImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.visitorType === "Other" && !otherVisitorType.trim()) {
      toast.error("Please specify the visitor type");
      return;
    }

    const finalVisitorType =
      formData.visitorType === "Other"
        ? otherVisitorType.trim()
        : formData.visitorType;

    setLoading(true);
    try {
      await api.post("/visitors", {
        name: formData.name,
        purpose: finalVisitorType, // visitorType IS the purpose now
        wing: formData.wing,
        flatNumber: formData.flatNumber,
        contact: formData.contact,
        visitorType: finalVisitorType,
        vehicleNumber: formData.vehicleNumber,
        documentImage,
      });
      toast.success("Visitor entry logged successfully!");
      navigate("/dashboard/guard/todays-log");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to log visitor");
    } finally {
      setLoading(false);
    }
  };

  const userName =
    useAuth().user?.name || "Guard";

  return (
    <DashboardLayout role="guard" userName={userName}>
      <div className="space-y-6 pb-24 lg:pb-0">
        {/* ── Page Header ── */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl hover:bg-orange-50 hover:text-orange-600"
              onClick={() => navigate(-1)}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Log New Visitor
              </h1>
              <p className="text-muted-foreground mt-0.5">
                Register walk-in visitor with document verification
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-orange-50 border border-orange-200 rounded-full">
            <Shield className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-semibold text-orange-700">
              Gate Entry
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
            {/* ── LEFT: Visitor Details (3 cols) ── */}
            <div className="xl:col-span-3 space-y-5">
              {/* Visitor Type */}
              <Card className="border-none shadow-md">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold text-base">Visitor Type</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {VISITOR_TYPES.map(
                      ({ id, label, icon: Icon, color, selectedColor }) => (
                        <button
                          key={id}
                          type="button"
                          onClick={() => setField("visitorType", id)}
                          className={`flex flex-col items-center gap-2.5 p-4 rounded-2xl border-2 transition-all duration-200 ${
                            formData.visitorType === id ? selectedColor : color
                          }`}
                        >
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-semibold">{label}</span>
                        </button>
                      ),
                    )}
                  </div>

                  {/* "Other" text input */}
                  {formData.visitorType === "Other" && (
                    <div className="space-y-1.5 pt-1">
                      <Label htmlFor="otherType">Specify Visitor Type *</Label>
                      <Input
                        id="otherType"
                        placeholder=""
                        className="bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl"
                        value={otherVisitorType}
                        onChange={(e) => setOtherVisitorType(e.target.value)}
                        autoFocus
                        required
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Personal Info */}
              <Card className="border-none shadow-md">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold text-base">Visitor Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        placeholder=""
                        className="bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl"
                        value={formData.name}
                        onChange={(e) => setField("name", e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="contact">Phone Number</Label>
                      <Input
                        id="contact"
                        type="tel"
                        placeholder="+91"
                        className="bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl"
                        value={formData.contact}
                        onChange={(e) => setField("contact", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label>Visiting Unit *</Label>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Block"
                        className="w-28 bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl uppercase placeholder:text-gray-400"
                        required
                        value={formData.wing}
                        onChange={(e) =>
                          setField("wing", e.target.value.toUpperCase())
                        }
                      />
                      <Input
                        placeholder="Flat No."
                        className="flex-1 bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl placeholder:text-gray-400"
                        required
                        value={formData.flatNumber}
                        onChange={(e) => setField("flatNumber", e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label
                      htmlFor="vehicle"
                      className="flex items-center gap-1.5"
                    >
                      <Car className="h-3.5 w-3.5 text-gray-400" />
                      Vehicle Number
                      <span className="text-[10px] text-gray-400 font-normal ml-1">
                        optional
                      </span>
                    </Label>
                    <Input
                      id="vehicle"
                      placeholder="e.g. MH 12 AB 1234"
                      className="bg-gray-50 border-gray-200 focus:bg-white h-12 rounded-xl uppercase tracking-widest placeholder:text-gray-400 placeholder:tracking-normal"
                      value={formData.vehicleNumber}
                      onChange={(e) =>
                        setField("vehicleNumber", e.target.value.toUpperCase())
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ── RIGHT: Document Scan + Summary (2 cols) ── */}
            <div className="xl:col-span-2 space-y-5">
              {/* Document Scan */}
              <Card className="border-none shadow-md">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h2 className="font-bold text-base">Identity Document</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aadhar Card, Driving License, or any Govt. ID
                    </p>
                  </div>

                  {documentImage ? (
                    <div className="relative rounded-2xl overflow-hidden border-2 border-blue-300 bg-blue-50">
                      <img
                        src={documentImage}
                        alt="Scanned Document"
                        className="w-full h-64 object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1 bg-emerald-500/90 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
                        <CheckCircle2 className="h-3 w-3" />
                        Captured
                      </div>
                      <button
                        type="button"
                        onClick={() => setDocumentImage(null)}
                        className="absolute top-3 right-3 p-1.5 bg-black/60 text-white rounded-full hover:bg-black/80 backdrop-blur-sm transition"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="w-full flex flex-col items-center gap-3 h-40 border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-700 rounded-2xl transition-all"
                      >
                        <Camera className="h-9 w-9 mt-8" />
                        <div className="text-center">
                          <p className="text-sm font-bold">Scan with Camera</p>
                          <p className="text-xs text-blue-500 mt-0.5">
                            Opens rear camera
                          </p>
                        </div>
                      </button>

                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-xs text-gray-400 font-medium">
                          or
                        </span>
                        <div className="flex-1 h-px bg-gray-200" />
                      </div>

                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 text-gray-500 rounded-xl transition-all"
                      >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm font-semibold">
                          Upload from Gallery
                        </span>
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-gray-400 text-center">
                    Max 5 MB · JPG, PNG supported
                  </p>

                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </CardContent>
              </Card>

              {/* Entry Summary */}
              <Card className="border-none shadow-md bg-gray-900 text-white">
                <CardContent className="p-6 space-y-4">
                  <h2 className="font-bold text-base text-gray-200">
                    Entry Summary
                  </h2>

                  <div className="space-y-2 text-sm">
                    {[
                      { label: "Name", value: formData.name || "—" },
                      {
                        label: "Unit",
                        value:
                          formData.wing && formData.flatNumber
                            ? `${formData.wing}-${formData.flatNumber}`
                            : "—",
                        mono: true,
                      },
                      {
                        label: "Type",
                        value:
                          formData.visitorType === "Other"
                            ? otherVisitorType || "Other (specify above)"
                            : formData.visitorType,
                      },
                    ].map(({ label, value, mono }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-gray-400">{label}</span>
                        <span
                          className={`font-medium truncate max-w-[160px] ${mono ? "font-mono" : ""}`}
                        >
                          {value}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-gray-400">Document</span>
                      <span
                        className={`font-medium ${documentImage ? "text-emerald-400" : "text-gray-500"}`}
                      >
                        {documentImage ? "✓ Captured" : "Not scanned"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Entry Time</span>
                      <span className="font-mono text-orange-400">
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/10">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="w-full h-12 text-base font-bold bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl shadow-lg hover:shadow-orange-500/40 transition-all"
                    >
                      {loading ? "Logging Entry..." : "✓ Confirm Entry"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
