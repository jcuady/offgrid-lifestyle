import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ShoppingBag, Menu, X, UserRound } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/src/lib/utils";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { localAuthService } from "@/src/services";
import { formatPrice } from "@/src/data/products";
import { siteContainer } from "@/src/lib/brandLayout";
import { CUSTOMER_SIGN_IN_PATH, CUSTOMER_SIGN_UP_PATH, PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { usePwaStandalone } from "@/src/hooks/usePwaStandalone";
import { openInstallGuide } from "@/src/lib/pwa";

const ACCOUNT_MENU_ID = "navbar-account-menu";

/** Mirrors DH Ultimate custom-order IA — deep-links into `/custom#:slug` guide panels. */
const CUSTOM_NAV_LINKS = [
  { label: "How to order", to: "/custom#how-to-order" },
  { label: "Product catalog", to: "/shop" },
  { label: "Team deals", to: "/custom#team-deals" },
  { label: "Sizing chart", to: "/custom#sizing-chart" },
  { label: "Free jersey promo", to: "/custom#free-jersey-promo" },
  { label: "FAQ", to: "/custom#faqs" },
] as const;

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCustomMenuOpen, setIsCustomMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { toggleCart, cart, openCheckout } = useStore(
    useShallow((state) => ({
      toggleCart: state.toggleCart,
      cart: state.cart,
      openCheckout: state.openCheckout,
    })),
  );
  const currentUser = usePortalStore((state) => state.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const cartDropdownRef = useRef<HTMLDivElement | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const isStandalone = usePwaStandalone();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Keep header readable on non-home routes so brand/logo/action controls stay visible. */
  const forceSolidOnTop =
    location.pathname !== "/" ||
    isMobileMenuOpen ||
    isCartDropdownOpen ||
    isCustomMenuOpen ||
    isAccountMenuOpen;
  const navSolid = isScrolled || forceSolidOnTop;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartDropdownOpen(false);
    setIsCustomMenuOpen(false);
    setIsAccountMenuOpen(false);
    setIsScrolled(window.scrollY > 50);
  }, [location]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (cartDropdownRef.current?.contains(target)) return;
      setIsCartDropdownOpen(false);
      if (accountDropdownRef.current?.contains(target)) return;
      setIsAccountMenuOpen(false);
    };
    window.addEventListener("mousedown", onClick);
    return () => window.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (!isAccountMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsAccountMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isAccountMenuOpen]);

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    const role = currentUser?.role;
    await localAuthService.logout();
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    if (role === "admin" || role === "staff") {
      navigate(PORTAL_LOGIN_PATH);
      return;
    }
    navigate(CUSTOMER_SIGN_IN_PATH);
  };

  const navLinks = [
    { name: "OG Signatures", action: () => handleNavigate("/og-signatures") },
    { name: "Shop", action: () => handleNavigate("/shop") },
    { name: "Events", action: () => handleNavigate("/events") },
    { name: "About", action: () => handleNavigate("/about") },
    { name: "Testimonials", action: () => handleNavigate("/testimonials") },
    { name: "Contact", action: () => handleNavigate("/contact") },
  ];

  type AccountMenuItem = { label: string; onSelect: () => void; tone?: "danger" };

  const onAccountRoute = location.pathname.startsWith("/account");

  const accountLabel = currentUser
    ? currentUser.name?.trim().split(/\s+/)[0] || currentUser.email.split("@")[0]
    : "Sign In";

  const openInstallGuideFromMenu = () => {
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    openInstallGuide();
  };

  const installItem: AccountMenuItem = { label: "Install App", onSelect: openInstallGuideFromMenu };

  const buildAccountMenuItems = (): AccountMenuItem[] => {
    const withInstall = (items: AccountMenuItem[]): AccountMenuItem[] => {
      if (isStandalone) return items;
      const dangerIndex = items.findIndex((i) => i.tone === "danger");
      if (dangerIndex === -1) return [...items, installItem];
      return [...items.slice(0, dangerIndex), installItem, ...items.slice(dangerIndex)];
    };

    if (!currentUser) {
      return withInstall([
        { label: "Sign In", onSelect: () => handleNavigate(CUSTOMER_SIGN_IN_PATH) },
        { label: "Create Account", onSelect: () => handleNavigate(CUSTOMER_SIGN_UP_PATH) },
        { label: "Custom Order", onSelect: () => handleNavigate("/custom/order") },
      ]);
    }
    if (currentUser.role === "customer") {
      return withInstall([
        { label: "My Orders", onSelect: () => handleNavigate("/account/orders") },
        { label: "Profile", onSelect: () => handleNavigate("/account/profile") },
        { label: "Custom Order", onSelect: () => handleNavigate("/custom") },
        { label: "Sign out", onSelect: handleSignOut, tone: "danger" },
      ]);
    }
    const portalBase = currentUser.role === "admin" ? "/portal/admin" : "/portal/staff";
    return withInstall([
      { label: "Portal Dashboard", onSelect: () => handleNavigate(portalBase) },
      { label: "Operations Orders", onSelect: () => handleNavigate(`${portalBase}/orders`) },
      { label: "Sign out", onSelect: handleSignOut, tone: "danger" },
    ]);
  };

  const accountPanelClass = cn(
    "rounded-2xl border border-offgrid-green/15 bg-offgrid-cream p-2 shadow-2xl text-left z-[60]",
    "fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+4.25rem)] w-auto",
    "sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-64",
  );

  const renderDesktopAccountItems = () =>
    buildAccountMenuItems().map((item) => (
      <button
        key={item.label}
        type="button"
        role="menuitem"
        onClick={() => item.onSelect()}
        className={cn(
          "w-full rounded-xl px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] transition-colors",
          item.tone === "danger"
            ? "text-red-700 hover:bg-red-50"
            : "text-offgrid-green hover:bg-offgrid-green/5",
        )}
      >
        {item.label}
      </button>
    ));

  const renderMobileAccountItems = () =>
    buildAccountMenuItems().map((item) => (
      <button
        key={item.label}
        type="button"
        onClick={() => item.onSelect()}
        className={cn(
          "w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold uppercase tracking-[0.08em] transition-colors",
          item.tone === "danger"
            ? "border-red-400/35 text-red-200 hover:bg-red-950/35"
            : "border-offgrid-cream/15 bg-offgrid-cream/10 text-offgrid-cream hover:bg-offgrid-cream/20",
        )}
      >
        {item.label}
      </button>
    ));

  return (
    <>
      <AnimatePresence>
        {isCartDropdownOpen || isAccountMenuOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[55] bg-offgrid-dark/40 sm:hidden"
            aria-hidden
            onClick={() => {
              setIsCartDropdownOpen(false);
              setIsAccountMenuOpen(false);
            }}
          />
        ) : null}
      </AnimatePresence>
      <header
        className={cn(
          "fixed left-0 right-0 z-50 transition-all duration-300 ease-in-out top-[var(--pwa-install-banner-height,0px)]",
          isStandalone && "pt-[env(safe-area-inset-top)]",
          navSolid ? "bg-offgrid-green/95 backdrop-blur-md py-3 shadow-sm" : "bg-transparent py-5",
        )}
      >
        <div className={cn(siteContainer, "flex min-w-0 items-center justify-between gap-3")}>
          <Link to="/" className="flex shrink-0 items-center z-50">
            <img src={LOGO_WORDMARK_WHITE} alt="OFF GRID® — OffGrid Lifestyle" className="h-8 w-auto sm:h-10" />
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <div
              className="relative"
              onMouseEnter={() => setIsCustomMenuOpen(true)}
              onMouseLeave={() => setIsCustomMenuOpen(false)}
            >
              <button
                onClick={() => handleNavigate("/custom")}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                Custom Order
              </button>
              <AnimatePresence>
                {isCustomMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className="absolute left-0 top-full mt-3 w-72 rounded-2xl border border-offgrid-green/15 bg-offgrid-cream p-3 shadow-2xl"
                  >
                    <button
                      onClick={() => handleNavigate("/custom/order")}
                      className="mb-2 block w-full rounded-xl bg-offgrid-green px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream hover:bg-offgrid-green/90"
                    >
                      Place custom order
                    </button>
                    <button
                      onClick={() => handleNavigate("/custom/templates")}
                      className="mb-2 block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green hover:bg-offgrid-green/5"
                    >
                      Templates
                    </button>
                    <div className="my-2 border-t border-offgrid-green/10" />
                    {CUSTOM_NAV_LINKS.map((link) => (
                      <button
                        key={link.to}
                        onClick={() => handleNavigate(link.to)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-offgrid-green/80 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                      >
                        {link.label}
                      </button>
                    ))}
                    <div className="my-2 border-t border-offgrid-green/10" />
                    <button
                      onClick={() => handleNavigate("/custom")}
                      className="block w-full rounded-xl px-3 py-2 text-left text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-green/60 hover:bg-offgrid-green/5"
                    >
                      Full ordering guide
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {navLinks.map((link) => (
              <button
                key={link.name}
                onClick={link.action}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-white cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="flex min-w-0 shrink-0 items-center gap-2 sm:gap-3 md:gap-4 z-50">
            <Button variant="secondary" size="sm" className="hidden md:inline-flex" onClick={() => handleNavigate("/shop")}>
              Shop Now
            </Button>

            {currentUser ? (
              <NotificationBell
                variant="dark"
                settingsHref={
                  currentUser.role === "customer"
                    ? "/account/profile"
                    : currentUser.role === "admin"
                      ? "/portal/admin/settings"
                      : undefined
                }
              />
            ) : null}

            <div className="relative" ref={accountDropdownRef}>
              <button
                type="button"
                id="navbar-account-trigger"
                aria-expanded={isAccountMenuOpen}
                aria-controls={ACCOUNT_MENU_ID}
                aria-haspopup="menu"
                onClick={() => {
                  setIsCartDropdownOpen(false);
                  setIsAccountMenuOpen((prev) => !prev);
                }}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-2.5 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors sm:px-3 sm:py-1.5",
                  onAccountRoute
                    ? "border-offgrid-lime bg-offgrid-lime/20 text-white"
                    : "border-offgrid-cream/35 text-offgrid-cream hover:border-white hover:text-white",
                )}
                title={currentUser ? "Account menu" : "Sign in"}
              >
                <UserRound className="w-4 h-4 shrink-0" />
                <span className="hidden max-w-[7rem] truncate sm:inline">{accountLabel}</span>
              </button>
              <AnimatePresence>
                {isAccountMenuOpen && (
                  <motion.div
                    id={ACCOUNT_MENU_ID}
                    role="menu"
                    aria-labelledby="navbar-account-trigger"
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={accountPanelClass}
                  >
                    {currentUser ? (
                      <p className="border-b border-offgrid-green/10 px-3 py-2 text-[11px] text-offgrid-green/55">
                        Signed in as{" "}
                        <span className="font-semibold text-offgrid-green">{currentUser.email}</span>
                      </p>
                    ) : null}
                    <div className="flex flex-col p-1">{renderDesktopAccountItems()}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={cartDropdownRef}>
              <button
                type="button"
                onClick={() => {
                  setIsAccountMenuOpen(false);
                  setIsCartDropdownOpen((prev) => !prev);
                }}
                className={cn("p-2 transition-colors hover:text-white relative", "text-offgrid-cream")}
              >
                <ShoppingBag className="w-5 h-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-offgrid-lime text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-md"
                    >
                      {itemCount}
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
              <AnimatePresence>
                {isCartDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className={cn(
                      "rounded-2xl border border-offgrid-green/10 bg-offgrid-cream p-4 text-offgrid-green shadow-2xl z-[60]",
                      "fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+4.25rem)] w-auto",
                      "sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-display font-bold">Cart Preview</p>
                      <p className="text-xs text-offgrid-green/50">{itemCount} item(s)</p>
                    </div>
                    {cart.length === 0 ? (
                      <p className="rounded-xl bg-white px-3 py-3 text-xs text-offgrid-green/60">
                        Cart is empty. Add items from the shop.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {cart.slice(0, 3).map((item) => (
                          <div
                            key={`${item.productId}-${item.size}-${item.color}`}
                            className="flex items-center justify-between rounded-xl bg-white px-3 py-2.5 text-xs"
                          >
                            <p className="max-w-[170px] truncate font-semibold">{item.name}</p>
                            <span>x{item.quantity}</span>
                          </div>
                        ))}
                        {cart.length > 3 && (
                          <p className="text-[11px] text-offgrid-green/50">+{cart.length - 3} more item(s)</p>
                        )}
                        <div className="mt-2 border-t border-offgrid-green/10 pt-2 flex items-center justify-between">
                          <p className="text-xs text-offgrid-green/50">Subtotal</p>
                          <p className="font-semibold">{formatPrice(cartSubtotal)}</p>
                        </div>
                      </div>
                    )}
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartDropdownOpen(false);
                          toggleCart(true);
                        }}
                        className="rounded-xl border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] hover:bg-offgrid-green/5 transition-colors"
                      >
                        View Cart
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsCartDropdownOpen(false);
                          if (cart.length > 0) {
                            openCheckout();
                          } else {
                            toggleCart(true);
                          }
                        }}
                        className="rounded-xl bg-offgrid-green px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream hover:bg-offgrid-dark transition-colors"
                      >
                        Checkout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <button
              type="button"
              className={cn("md:hidden p-2 transition-colors", "text-offgrid-cream")}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 flex flex-col overflow-y-auto bg-offgrid-green px-4 pb-6 pt-24 sm:px-6"
          >
            <nav className="flex flex-col gap-6 text-center mt-12 overflow-y-auto">
              <button
                onClick={() => handleNavigate("/custom/order")}
                className="text-3xl font-display font-bold text-offgrid-cream hover:text-white transition-colors cursor-pointer"
              >
                Place custom order
              </button>
              <button
                onClick={() => handleNavigate("/custom/templates")}
                className="text-xl font-display font-semibold text-offgrid-cream/80 hover:text-white transition-colors cursor-pointer"
              >
                Templates
              </button>
              {CUSTOM_NAV_LINKS.map((link) => (
                <button
                  key={link.to}
                  onClick={() => handleNavigate(link.to)}
                  className="text-lg font-display font-semibold text-offgrid-cream/75 hover:text-white transition-colors cursor-pointer"
                >
                  {link.label}
                </button>
              ))}
              <button
                onClick={() => handleNavigate("/custom")}
                className="text-lg font-display font-semibold text-offgrid-cream/60 hover:text-white transition-colors cursor-pointer"
              >
                Full ordering guide
              </button>
              {navLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    link.action();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-3xl font-display font-bold text-offgrid-cream hover:text-white transition-colors cursor-pointer"
                >
                  {link.name}
                </button>
              ))}

              <div className="mx-auto mt-4 w-full max-w-xs border-t border-offgrid-cream/15 pt-6">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-offgrid-cream/45">Account</p>
                <div className="flex flex-col gap-2">{renderMobileAccountItems()}</div>
              </div>
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
