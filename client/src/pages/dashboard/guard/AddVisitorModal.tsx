import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, Upload, X } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { AxiosError } from "axios";

interface AddVisitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVisitorModal({
  isOpen,
  onClose,
  onSuccess,
}: AddVisitorModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    purpose: "Guest",
    wing: "",
    flatNumber: "",
    contact: "",
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
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        name: "",
        purpose: "Guest",
        wing: "",
        flatNumber: "",
        contact: "",
      });
      setDocumentImage(null);
    } catch (error) {
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to log visitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Log New Visitor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Visitor Name</Label>
            <Input
              id="name"
              required
              placeholder="Enter your name"
              className="bg-gray-100 border-transparent focus:bg-white transition-colors"
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
                placeholder="+91"
                className="bg-gray-100 border-transparent focus:bg-white transition-colors"
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
                  placeholder=""
                  className="w-20 bg-gray-100 border-transparent focus:bg-white transition-colors"
                  required
                  value={formData.wing}
                  onChange={(e) =>
                    setFormData({ ...formData, wing: e.target.value })
                  }
                />
                <Input
                  id="flat"
                  placeholder=""
                  className="flex-1 bg-gray-100 border-transparent focus:bg-white transition-colors"
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
            <Label>Purpose</Label>
            <div className="flex flex-wrap gap-2">
              {["Delivery", "Guest", "Service", "Other"].map((p) => (
                <Button
                  key={p}
                  type="button"
                  variant={formData.purpose === p ? "default" : "outline"}
                  className={`flex-1 rounded-full ${formData.purpose === p ? "bg-orange-500 hover:bg-orange-600 text-white" : "hover:bg-gray-100"}`}
                  onClick={() => setFormData({ ...formData, purpose: p })}
                >
                  {p}
                </Button>
              ))}
            </div>
            {formData.purpose === "Other" && (
              <Input
                placeholder=""
                className="mt-2 bg-gray-100 border-transparent focus:bg-white"
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
                  capture="environment"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-12 w-full sm:w-auto rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="h-12 w-full sm:w-1/3 bg-gray-700 hover:bg-gray-800 text-white rounded-xl"
            >
              {loading ? "Adding..." : "Add Entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
