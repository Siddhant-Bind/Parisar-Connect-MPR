import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Menu,
  User,
  Building2,
  Users,
  LogOut,
  ChevronDown,
  LayoutDashboard,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import api from "@/lib/api";
import { safeParseJSON } from "@/lib/utils";
import logo from "@/assets/logo.png";

const Header = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Check if a user is logged in via localStorage
  const user = safeParseJSON<{ name?: string; email?: string; role?: string } | null>(
    localStorage.getItem("user"),
    null,
  );
  const isLoggedIn = Boolean(user);
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "A";

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // ignore — still clear local state
    } finally {
      localStorage.removeItem("user");
      toast.success("Logged out successfully");
      navigate("/");
    }
  };

  const UserMenu = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 rounded-xl px-3 h-10 hover:bg-accent"
          id="user-menu-trigger"
        >
          <Avatar className="w-8 h-8">
            <AvatarFallback className="bg-gradient-warm text-primary-foreground text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-52 rounded-2xl p-1.5 shadow-elevated"
      >
        {user?.name && (
          <>
            <div className="px-3 py-2">
              <p className="text-sm font-semibold text-foreground">
                {user.name}
              </p>
              {user?.email && (
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              )}
            </div>
            <DropdownMenuSeparator />
          </>
        )}

        {user?.role && (
          <DropdownMenuItem
            className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-accent"
            onClick={() => {
              const dashboardProps: Record<string, string> = {
                ADMIN: "/dashboard/admin",
                RESIDENT: "/dashboard/resident",
                GUARD: "/dashboard/guard",
              };
              navigate(dashboardProps[user.role] || "/");
            }}
            id="dashboard-menu-item"
          >
            <LayoutDashboard className="w-4 h-4 text-primary" />
            <span className="font-medium">Dashboard</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem
          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-accent"
          onClick={() => navigate("/create-society")}
          id="create-society-menu-item"
        >
          <Building2 className="w-4 h-4 text-primary" />
          <span className="font-medium">Create a Society</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 hover:bg-accent"
          onClick={() => navigate("/join-society")}
          id="join-society-menu-item"
        >
          <Users className="w-4 h-4 text-primary" />
          <span className="font-medium">Join a Society</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="flex items-center gap-3 cursor-pointer rounded-xl px-3 py-2.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={handleLogout}
          id="logout-menu-item"
        >
          <LogOut className="w-4 h-4" />
          <span className="font-medium">Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <nav className="nav-floating bg-card/90 rounded-xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center">
            <img src={logo} alt="logo" className="scale-110 sm:scale-110" />
          </div>
          <span className="font-bold text-xl text-foreground leading-4 scale-75 sm:scale-90">
            Parisar <br />
            Connect
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground rounded-xl"
          >
            Features
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground rounded-xl"
          >
            About
          </Button>
          <Button
            variant="ghost"
            className="text-muted-foreground hover:text-foreground rounded-xl"
          >
            Contact
          </Button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-3">
          <ModeToggle />
          {isLoggedIn ? (
            <UserMenu />
          ) : (
            <>
              <Button
                variant="ghost"
                className="text-foreground hover:text-primary rounded-xl font-semibold"
                asChild
              >
                <Link to="/login">Login</Link>
              </Button>
              <Button
                className="bg-gradient-warm text-primary-foreground rounded-xl shadow-button btn-press font-semibold px-6"
                asChild
              >
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden scale-150">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[280px] bg-card border-l-0 rounded-l-3xl"
          >
            <div className="flex items-center scale-90">
              <ModeToggle />
            </div>
            <div className="flex flex-col">
              <nav className="flex flex-col gap-2">
                <a
                  href="#features"
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </a>
                <a
                  href="#about"
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </a>
                <a
                  href="#contact"
                  className="px-4 py-3 text-lg font-medium text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </a>
              </nav>

              <div className="flex flex-col gap-3 px-4 pt-4 border-t border-border">
                {isLoggedIn ? (
                  <>
                    {user?.name && (
                      <p className="text-sm font-semibold px-1">{user.name}</p>
                    )}
                    {user?.role && (
                      <Button
                        variant="outline"
                        className="w-full rounded-xl font-semibold justify-start gap-2"
                        onClick={() => {
                          setIsOpen(false);
                          const dashboardProps: Record<string, string> = {
                            ADMIN: "/dashboard/admin",
                            RESIDENT: "/dashboard/resident",
                            GUARD: "/dashboard/guard",
                          };
                          navigate(dashboardProps[user.role] || "/");
                        }}
                      >
                        <LayoutDashboard className="w-4 h-4" /> Dashboard
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-semibold justify-start gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/create-society");
                      }}
                    >
                      <Building2 className="w-4 h-4" /> Create a Society
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-semibold justify-start gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        navigate("/join-society");
                      }}
                    >
                      <Users className="w-4 h-4" /> Join a Society
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full rounded-xl font-semibold text-destructive justify-start gap-2"
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="outline"
                      className="w-full rounded-xl font-semibold"
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button
                      className="w-full bg-gradient-warm text-primary-foreground rounded-xl shadow-button btn-press font-semibold"
                      onClick={() => setIsOpen(false)}
                      asChild
                    >
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
