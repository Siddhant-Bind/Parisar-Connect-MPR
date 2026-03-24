import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import logo from "@/assets/logo.png";

interface Society {
  id: string;
  name: string;
  address?: string;
}

const JoinSociety = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [societies, setSocieties] = useState<Society[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchSocieties = async () => {
      try {
        const { data } = await api.get("/societies");
        if (data.success) {
          setSocieties(data.data);
        } else {
          toast.error(data.message || "Failed to load societies");
        }
      } catch {
        toast.error("Failed to load societies");
      } finally {
        setFetching(false);
      }
    };
    fetchSocieties();
  }, []);

  const handleJoin = async () => {
    if (!selectedId) {
      toast.error("Please select a society");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/societies/join", {
        societyId: selectedId,
      });
      if (data.success) {
        // Clear query cache to ensure no data bleeds from previous session
        queryClient.clear();

        toast.success("Join request sent! Awaiting Creator Admin approval.");
        navigate("/");
      } else {
        toast.error(data.message || "Failed to submit join request");
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(
        error?.response?.data?.message || "Failed to submit join request",
      );
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
            <CardTitle className="text-2xl font-bold">Join a Society</CardTitle>
            <CardDescription className="text-muted-foreground">
              Request to join an existing society as Admin
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-4">
            {fetching ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : societies.length === 0 ? (
              <p className="text-center text-muted-foreground py-6">
                No societies registered yet.{" "}
                <Link
                  to="/create-society"
                  className="text-primary font-semibold hover:underline"
                >
                  Create one
                </Link>
              </p>
            ) : (
              <>
                <Select value={selectedId} onValueChange={setSelectedId}>
                  <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-gray-200">
                    <SelectValue placeholder="Select a society" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {societies.map((s) => (
                      <SelectItem
                        key={s.id}
                        value={s.id}
                        className="rounded-lg"
                      >
                        <div>
                          <p className="font-medium">{s.name}</p>
                          {s.address && (
                            <p className="text-xs text-muted-foreground">
                              {s.address}
                            </p>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  onClick={handleJoin}
                  disabled={loading || !selectedId}
                  className="w-full h-12 rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-button btn-press"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Request to Join"
                  )}
                </Button>
              </>
            )}

            <p className="text-center text-sm text-muted-foreground">
              Want to create a new society?{" "}
              <Link
                to="/create-society"
                className="text-primary font-semibold hover:underline"
              >
                Create instead
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default JoinSociety;
