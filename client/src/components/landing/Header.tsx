import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ModeToggle } from "@/components/mode-toggle";
import logo from "@/assets/logo.png";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-5xl">
      <nav className="nav-floating bg-card/90 rounded-xl px-6 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-0.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-warm flex items-center justify-center shadow-button">
            <img src={logo} alt="logo" className="scale-75 sm:scale-90" />
          </div>
          <span className="font-bold text-xl text-foreground  leading-4 scale-75 sm:scale-90 ">
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
          <ModeToggle /> {/* Dark Mode Feature*/}
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
            <div className="flex flex-col ">
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
                <div className="flex justify-end mb-2"></div>
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
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
};

export default Header;
