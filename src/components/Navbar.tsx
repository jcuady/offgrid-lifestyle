import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/src/lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/src/store/store";

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { toggleCart, cart } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const handleScrollToSection = (sectionId: string) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const navLinks = [
    { name: "Collections", action: () => handleScrollToSection("collections") },
    { name: "Shop", action: () => handleNavigate("/shop") },
    { name: "About", action: () => handleScrollToSection("about") },
    { name: "Events", action: () => handleNavigate("/events") },
  ];

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
          isScrolled
            ? "bg-offgrid-green/95 backdrop-blur-md py-3 shadow-sm"
            : "bg-transparent py-5"
        )}
      >
        <div className="container mx-auto px-6 md:px-12 flex items-center justify-between">
          {/* Logo */}
          <a href="#" className="flex items-center z-50">
            <img 
              src="/logo.png" 
              alt="OffGrid Lifestyle" 
              className="h-10 w-auto brightness-0 invert"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-offgrid-lime cursor-pointer",
                  isScrolled ? "text-offgrid-cream/80" : "text-offgrid-cream/90"
                )}
              >
                {link.name}
              </button>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4 z-50">
            <Button variant="secondary" size="sm" className="hidden md:inline-flex" onClick={() => handleNavigate("/shop")}>
              Shop Now
            </Button>
            <button 
              onClick={() => toggleCart()}
              className={cn(
                "p-2 transition-colors hover:text-offgrid-lime relative",
                "text-offgrid-cream"
              )}
            >
              <ShoppingBag className="w-5 h-5" />
              <AnimatePresence>
                {itemCount > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-offgrid-lime text-offgrid-dark rounded-full text-[10px] font-bold flex items-center justify-center shadow-md"
                  >
                    {itemCount}
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
            <button 
              className={cn("md:hidden p-2 transition-colors", "text-offgrid-cream")}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-offgrid-green pt-24 px-6 pb-6 flex flex-col"
          >
            <nav className="flex flex-col gap-6 text-center mt-12">
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={link.action}
                  className="text-3xl font-display font-bold text-offgrid-cream hover:text-offgrid-lime transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}
            </nav>
            <div className="mt-auto pb-8 flex justify-center">
              <Button variant="secondary" size="lg" className="w-full max-w-xs" onClick={() => handleNavigate("/shop")}>
                Shop Now
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
