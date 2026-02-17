import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Building2, Users, ShieldCheck, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="min-h-screen bg-gradient-hero pt-32 pb-20 px-4 overflow-hidden">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="max-w-xl animate-fade-in-up">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight mb-6">
              Live peacefully.{" "}
              <span className="text-primary block lg:inline">Stay connected.</span>
            </h1>
            <p className="text-md sm:text-xl text-muted-foreground mb-8 leading-relaxed">
              Everything your society needs — residents, security, and
              management — in one place.
              <div className="block sm:inline"> Simple tools for peaceful
              community living.</div>
            </p>
            <div className="flex flex-col gap-3 w-[calc(100%-3.3rem)] sm:flex-row sm:gap-4">
              <Button
                size="lg"
                className="bg-gradient-warm text-primary-foreground rounded-xl shadow-button btn-press font-bold text-lg px-8 py-6"
                asChild
              >
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-xl font-semibold text-lg px-8 py-6 border-2 hover:bg-accent"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex items-center gap-6 text-muted-foreground">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">10k+ Users</span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-secondary" />
                <span className="text-sm font-medium">Easy to use</span>
              </div>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative animate-fade-in-delay-2">
            <div className="relative w-full max-w-lg mx-auto">
              {/* Main illustration container */}
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-soft-peach via-light-yellow to-mint-green p-8 shadow-elevated">
                {/* Abstract buildings illustration */}
                <div className="h-full flex items-end justify-center gap-4 pb-8">
                  {/* Building 1 */}
                  <div className="w-16 sm:w-20 bg-deep-navy/90 rounded-t-2xl h-32 sm:h-40 relative animate-fade-in-delay-1">
                    <div className="absolute inset-x-2 top-4 grid grid-cols-2 gap-1.5">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm bg-light-yellow/80"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Building 2 (tallest) */}
                  <div className="w-20 sm:w-24 bg-secondary/90 rounded-t-3xl h-48 sm:h-56 relative animate-fade-in-delay-2">
                    <div className="absolute inset-x-3 top-6 grid grid-cols-2 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm bg-white/60"
                        />
                      ))}
                    </div>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-6 h-8 bg-white/80 rounded-t-lg" />
                  </div>
                  {/* Building 3 */}
                  <div className="w-14 sm:w-18 bg-primary/90 rounded-t-2xl h-36 sm:h-44 relative animate-fade-in-delay-3">
                    <div className="absolute inset-x-2 top-4 grid grid-cols-2 gap-1">
                      {[...Array(6)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm bg-white/70"
                        />
                      ))}
                    </div>
                  </div>
                  {/* Building 4 */}
                  <div className="w-12 sm:w-16 bg-deep-navy/80 rounded-t-xl h-28 sm:h-32 relative animate-fade-in-delay-4">
                    <div className="absolute inset-x-1.5 top-3 grid grid-cols-2 gap-1">
                      {[...Array(4)].map((_, i) => (
                        <div
                          key={i}
                          className="aspect-square rounded-sm bg-soft-peach/80"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 w-16 h-16 bg-card rounded-2xl shadow-card flex items-center justify-center animate-float">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div
                className="absolute -bottom-4 -left-4 w-14 h-14 bg-card rounded-xl shadow-card flex items-center justify-center animate-float"
                style={{ animationDelay: "1s" }}
              >
                <Users className="w-7 h-7 text-secondary" />
              </div>
              <div
                className="absolute top-1/3 -left-8 w-12 h-12 bg-primary rounded-full shadow-button flex items-center justify-center animate-float"
                style={{ animationDelay: "0.5s" }}
              >
                <ShieldCheck className="w-6 h-6 text-primary-foreground" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
