import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";
import logo from "@/assets/logo.png";

const CreateSociety = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Society name is required");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/societies/create", formData);
      if (data.success) {
        // Update stored user with societyId
        const user = safeParseJSON<Record<string, unknown>>(localStorage.getItem("user"), {});
        localStorage.setItem(
          "user",
          JSON.stringify({ ...user, societyId: data.data.id }),
        );

        // Clear React Query cache before navigating so old society data is removed
        queryClient.clear();

        toast.success(`"${formData.name}" created successfully!`);
        navigate("/dashboard/admin");
      } else {
        toast.error(data.message || "Failed to create society");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error?.response?.data?.message || "Failed to create society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <Link
        to="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back to Home</span>
      </Link>

      <div className="w-full max-w-md animate-fade-in-up">
        <Card className="rounded-3xl shadow-elevated border-0 bg-card/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center">
              <img
                src={logo}
                alt="Parisar Connect"
                className="w-full h-full object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold">
              Create a Society
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Register your housing society on Parisar Connect
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Society Name</Label>
                <Input
                  id="name"
                  placeholder=""
                  value={formData.name}
                  onChange={handleChange}
                  className="rounded-xl h-12 bg-muted/50 border-gray-200"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">
                  Address{" "}
                  <span className="text-muted-foreground text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="address"
                  placeholder=""
                  value={formData.address}
                  onChange={handleChange}
                  className="rounded-xl h-12 bg-muted/50 border-gray-200"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-button btn-press mt-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Society"
                )}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-muted-foreground">
              Want to join an existing society?{" "}
              <Link
                to="/join-society"
                className="text-primary font-semibold hover:underline"
              >
                Join instead
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateSociety;
