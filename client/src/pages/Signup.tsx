import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Check, Home, Shield, User } from "lucide-react";

const steps = [
  { id: 1, title: "Basic Info", icon: User },
  { id: 2, title: "Society", icon: Home },
  { id: 3, title: "Role", icon: Shield },
];

const demoSocieties = [
  { id: "1", name: "Sunshine Residency" },
  { id: "2", name: "Green Valley Apartments" },
  { id: "3", name: "Palm Heights Society" },
  { id: "4", name: "Royal Gardens" },
];

const Signup = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    society: "",
    flatNumber: "",
    role: "",
  });

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete signup - navigate based on role
      const roleRoutes: Record<string, string> = {
        resident: "/dashboard/resident",
        admin: "/dashboard/admin",
        guard: "/dashboard/guard",
      };
      navigate(roleRoutes[formData.role] || "/dashboard/resident");
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4 py-12">
      {/* Back to Home */}
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
            {/* Logo */}
            <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-button">
              <span className="text-primary-foreground font-bold text-2xl">
                P
              </span>
            </div>
            <CardTitle className="text-2xl font-bold">
              Create your account
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Join your community in just a few steps
            </CardDescription>

            {/* Step Indicator */}
            <div className="flex items-center justify-center gap-2 mt-6">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      currentStep > step.id
                        ? "bg-secondary text-secondary-foreground"
                        : currentStep === step.id
                          ? "bg-gradient-warm text-primary-foreground shadow-button"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-8 h-1 mx-1 rounded-full transition-colors duration-300 ${
                        currentStep > step.id ? "bg-secondary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Society Selection */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="space-y-2">
                  <Label>Select Your Society</Label>
                  <Select
                    value={formData.society}
                    onValueChange={(value) =>
                      setFormData({ ...formData, society: value })
                    }
                  >
                    <SelectTrigger className="rounded-xl h-12 bg-muted/50 border-0">
                      <SelectValue placeholder="Choose your society" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {demoSocieties.map((society) => (
                        <SelectItem
                          key={society.id}
                          value={society.id}
                          className="rounded-lg"
                        >
                          {society.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="flat">Flat / Unit Number</Label>
                  <Input
                    id="flat"
                    placeholder="e.g., A-101"
                    value={formData.flatNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, flatNumber: e.target.value })
                    }
                    className="rounded-xl h-12 bg-muted/50 border-0"
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Can't find your society?{" "}
                  <a
                    href="#"
                    className="text-primary font-medium hover:underline"
                  >
                    Register a new society
                  </a>
                </p>
              </div>
            )}

            {/* Step 3: Role Selection */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-fade-in">
                <Label>Select Your Role</Label>
                <div className="grid gap-3">
                  {[
                    {
                      id: "resident",
                      title: "Resident",
                      desc: "I live in this society",
                      icon: User,
                      color: "bg-soft-peach",
                    },
                    {
                      id: "admin",
                      title: "Admin",
                      desc: "I manage this society",
                      icon: Shield,
                      color: "bg-mint-green",
                    },
                    {
                      id: "guard",
                      title: "Security Guard",
                      desc: "I work as security",
                      icon: Shield,
                      color: "bg-light-yellow",
                    },
                  ].map((role) => (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, role: role.id })
                      }
                      className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        formData.role === role.id
                          ? "border-primary bg-primary/5"
                          : "border-transparent bg-muted/50 hover:bg-muted"
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-xl ${role.color} flex items-center justify-center`}
                      >
                        <role.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">
                          {role.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {role.desc}
                        </p>
                      </div>
                      {formData.role === role.id && (
                        <Check className="w-5 h-5 text-primary ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 h-12 rounded-xl font-semibold"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                className="flex-1 h-12 rounded-xl bg-gradient-warm text-primary-foreground font-bold shadow-button btn-press"
              >
                {currentStep === 3 ? "Complete Signup" : "Continue"}
                {currentStep < 3 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>

            {/* Login Link */}
            <p className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-primary font-semibold hover:underline"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Signup;
