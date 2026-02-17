import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, ChevronLeft, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AxiosError } from "axios";

export default function AddVisitorPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "",
    wing: "",
    flatNumber: "",
    contact: "",
    visitorType: "Guest",
    vehicleNumber: "",
  });
  const [documentImage, setDocumentImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDocumentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post("/visitors", {
        ...formData,
        documentImage,
      });
      toast.success("Visitor logged successfully");
      navigate("/dashboard/guard/todays-log");
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to log visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <Button
        variant="ghost"
        className="mb-4 pl-0 hover:bg-transparent hover:text-orange-500"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card className="border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Log New Visitor</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Visitor Name</Label>
              <Input
                id="name"
                required
                placeholder="Enter name"
                className="bg-gray-100 border-transparent focus:bg-white transition-colors h-12"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contact">Phone Number</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  placeholder="98765-43210"
                  className="bg-gray-100 border-transparent focus:bg-white transition-colors h-12"
                  onChange={(e) =>
                    setFormData({ ...formData, contact: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Visiting Unit</Label>
                <div className="flex gap-2">
                  <Input
                    id="wing"
                    placeholder="Wing"
                    className="w-24 bg-gray-100 border-transparent focus:bg-white transition-colors h-12"
                    required
                    value={formData.wing}
                    onChange={(e) =>
                      setFormData({ ...formData, wing: e.target.value })
                    }
                  />
                  <Input
                    id="flat"
                    placeholder="Flat No."
                    className="flex-1 bg-gray-100 border-transparent focus:bg-white transition-colors h-12"
                    required
                    value={formData.flatNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, flatNumber: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Visitor Type</Label>
              <div className="flex gap-2">
                {["Guest", "Delivery", "Staff"].map((type) => (
                  <Button
                    key={type}
                    type="button"
                    variant={
                      formData.visitorType === type ? "default" : "outline"
                    }
                    className={`flex-1 ${
                      formData.visitorType === type
                        ? "bg-gray-900 text-white"
                        : ""
                    }`}
                    onClick={() =>
                      setFormData({ ...formData, visitorType: type })
                    }
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicle">Vehicle Number (Optional)</Label>
              <Input
                id="vehicle"
                placeholder="MH-12-AB-1234"
                className="bg-gray-100 border-transparent focus:bg-white transition-colors h-12 uppercase"
                value={formData.vehicleNumber}
                onChange={(e) =>
                  setFormData({ ...formData, vehicleNumber: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Purpose</Label>
              <div className="flex flex-wrap gap-2">
                {["Personal", "Service", "Delivery", "Other"].map((p) => (
                  <Button
                    key={p}
                    type="button"
                    variant={formData.purpose === p ? "default" : "outline"}
                    className={`flex-1 min-w-[100px] h-10 rounded-full ${formData.purpose === p ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-gray-100"}`}
                    onClick={() => setFormData({ ...formData, purpose: p })}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              {formData.purpose === "Other" && (
                <Input
                  placeholder="Specify purpose"
                  className="mt-2 bg-gray-100 border-transparent focus:bg-white h-12"
                  onChange={(e) =>
                    setFormData({ ...formData, purpose: e.target.value })
                  }
                />
              )}
            </div>

            <div className="space-y-4">
              <Label className="text-base font-semibold">Document</Label>
              {documentImage ? (
                <div className="relative w-full h-48 bg-gray-100 rounded-xl overflow-hidden border-2 border-slate-200">
                  <img
                    src={documentImage}
                    alt="Document"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setDocumentImage(null)}
                    className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-sm transition-all"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="h-14 w-full border-2 border-dashed border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 text-blue-700 rounded-xl flex items-center justify-center gap-2 transition-all"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-5 w-5" />
                    <span className="font-semibold">
                      Scan Document / Take Photo
                    </span>
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Tap to open camera or upload from gallery
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    // @ts-ignore
                    capture="environment"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-14 text-lg font-semibold bg-gray-900 hover:bg-black text-white rounded-xl mt-4"
            >
              {loading ? "Adding Visitor..." : "Log Entry"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
