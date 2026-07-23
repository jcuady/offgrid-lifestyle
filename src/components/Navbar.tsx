import { useState, useEffect, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useShallow } from "zustand/react/shallow";
import { ShoppingBag, Menu, X, UserRound } from "lucide-react";
import { Button } from "./ui/Button";
import { cn } from "@/src/lib/utils";
import { LOGO_WORDMARK_WHITE } from "@/src/lib/brandAssets";
import { motion, AnimatePresence } from "motion/react";
import { useStore } from "@/src/store/store";
import { usePortalStore } from "@/src/store/usePortalStore";
import { useSiteContentStore } from "@/src/store/useSiteContentStore";
import { localAuthService } from "@/src/services";
import { formatPrice } from "@/src/data/products";
import {
  headerContainer,
  headerLogoClass,
  headerNavLinkClass,
  sectionEyebrowOnDark,
} from "@/src/lib/brandLayout";
import { CUSTOMER_SIGN_IN_PATH, CUSTOMER_SIGN_UP_PATH, PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import { NotificationBell } from "@/src/components/notifications/NotificationBell";
import { usePwaStandalone } from "@/src/hooks/usePwaStandalone";
import { openInstallGuide } from "@/src/lib/pwa";
import { SHOP_BY_COLLECTION } from "@/src/lib/shopTaxonomy";
import { compareSports, getProductSports } from "@/src/data/products";

const ACCOUNT_MENU_ID = "navbar-account-menu";
const dropdownPanel =
  "absolute left-0 top-full mt-3 w-72 rounded-2xl border border-offgrid-green/15 bg-offgrid-cream p-3 shadow-2xl";

/** Mobile drawer — two-tier type scale aligned with brandLayout tokens. */
const mobileNavPrimary =
  "min-h-11 w-full font-display text-2xl font-bold tracking-tight text-offgrid-cream transition-colors hover:text-white";
const mobileNavSecondary =
  "min-h-11 w-full font-sans text-lg font-medium text-offgrid-cream/80 transition-colors hover:text-white";
const headerIconBtn =
  "grid h-11 w-11 shrink-0 place-items-center rounded-full text-offgrid-cream transition-colors hover:bg-offgrid-cream/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offgrid-cream/50";

function publishHeaderHeight(el: HTMLElement | null) {
  if (!el || typeof document === "undefined") return;
  document.documentElement.style.setProperty("--og-header-height", `${el.offsetHeight}px`);
}

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCartDropdownOpen, setIsCartDropdownOpen] = useState(false);
  const [isCustomMenuOpen, setIsCustomMenuOpen] = useState(false);
  const [isSportMenuOpen, setIsSportMenuOpen] = useState(false);
  const [isCollectionMenuOpen, setIsCollectionMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const { toggleCart, cart, openCheckout } = useStore(
    useShallow((state) => ({
      toggleCart: state.toggleCart,
      cart: state.cart,
      openCheckout: state.openCheckout,
    })),
  );
  const currentUser = usePortalStore((state) => state.currentUser);
  const products = useSiteContentStore((state) => state.products);
  const navigate = useNavigate();
  const location = useLocation();
  const cartDropdownRef = useRef<HTMLDivElement | null>(null);
  const accountDropdownRef = useRef<HTMLDivElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const isStandalone = usePwaStandalone();

  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const sportLinks = useMemo(
    () =>
      [...new Set(products.filter((product) => product.status === "active").flatMap(getProductSports))]
        .sort(compareSports)
        .map((sport) => ({
          label: sport,
          href: `/shop?category=${encodeURIComponent(sport)}`,
          description: `Shop OFFGRID ${sport} products.`,
        })),
    [products],
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** Keep header readable on non-home routes so brand/logo/action controls stay visible. */
  const forceSolidOnTop =
    location.pathname !== "/" ||
    isMobileMenuOpen ||
    isCartDropdownOpen ||
    isCustomMenuOpen ||
    isSportMenuOpen ||
    isCollectionMenuOpen ||
    isAccountMenuOpen;
  const navSolid = isScrolled || forceSolidOnTop;

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const sync = () => publishHeaderHeight(el);
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    window.addEventListener("orientationchange", sync);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", sync);
    };
  }, [navSolid, isStandalone, isMobileMenuOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsCartDropdownOpen(false);
    setIsCustomMenuOpen(false);
    setIsSportMenuOpen(false);
    setIsCollectionMenuOpen(false);
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

  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isMobileMenuOpen]);

  const handleNavigate = (path: string) => {
    if (path.startsWith("/#") || path.startsWith("#")) {
      const id = path.replace(/^\/?#/, "");
      navigate({ pathname: "/", hash: id });
      setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
    } else if (path.includes("?")) {
      const url = new URL(path, window.location.origin);
      navigate({ pathname: url.pathname, search: url.search });
    } else {
      navigate(path);
    }
    setIsAccountMenuOpen(false);
    setIsMobileMenuOpen(false);
    setIsCustomMenuOpen(false);
    setIsSportMenuOpen(false);
    setIsCollectionMenuOpen(false);
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
    { name: "Events", fullName: "Events and Sports", action: () => handleNavigate("/community") },
    { name: "FAQ", fullName: "FAQ", action: () => handleNavigate("/faq") },
    { name: "Contact", fullName: "Contact", action: () => handleNavigate("/contact") },
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
    "fixed inset-x-3 top-[calc(var(--og-header-height,4.5rem)+0.5rem)] w-auto",
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
          "w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition-colors",
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
          "min-h-11 w-full rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-colors",
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
        ref={headerRef}
        className={cn(
          "fixed left-0 right-0 top-0 z-50 transition-[background-color,box-shadow,padding,backdrop-filter] duration-300 ease-out",
          isStandalone && "pt-[env(safe-area-inset-top)]",
          navSolid
            ? "border-b border-white/10 bg-offgrid-green/95 py-[clamp(0.55rem,1.2vw,0.85rem)] shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-offgrid-green/88"
            : "bg-transparent py-[clamp(0.85rem,2.2vw,1.35rem)] [@media(orientation:landscape)_and_(max-height:700px)]:py-2",
        )}
      >
        <div className={headerContainer}>
          <Link to="/" className="z-50 flex min-w-0 shrink-0 items-center">
            <img src={LOGO_WORDMARK_WHITE} alt="OFFGRID® Lifestyle" className={headerLogoClass} />
          </Link>

          {/* Desktop links only from xl — md/lg stay in the drawer to avoid overflow. */}
          <nav
            className="hidden min-w-0 items-center justify-center gap-[clamp(0.35rem,1.1vw,1.35rem)] xl:flex"
            aria-label="Primary"
          >
            <div
              className="relative"
              onMouseEnter={() => setIsCustomMenuOpen(true)}
              onMouseLeave={() => setIsCustomMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => handleNavigate("/custom/order")}
                className={cn(
                  headerNavLinkClass,
                  "cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                Custom
              </button>
              <AnimatePresence>
                {isCustomMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={dropdownPanel}
                  >
                    <button
                      type="button"
                      onClick={() => handleNavigate("/custom/order")}
                      className="mb-1 block w-full rounded-xl bg-offgrid-green px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream hover:bg-offgrid-green/90"
                    >
                      Start a team order
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/custom/templates")}
                      className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-offgrid-green/80 hover:bg-offgrid-green/5"
                    >
                      Templates
                    </button>
                    <button
                      type="button"
                      onClick={() => handleNavigate("/custom")}
                      className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-offgrid-green/80 hover:bg-offgrid-green/5"
                    >
                      Ordering guide
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsSportMenuOpen(true)}
              onMouseLeave={() => setIsSportMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => handleNavigate("/#collections")}
                className={cn(
                  headerNavLinkClass,
                  "cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                By Sport
              </button>
              <AnimatePresence>
                {isSportMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={dropdownPanel}
                  >
                    {sportLinks.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-offgrid-green/80 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                      >
                        <span className="font-semibold text-offgrid-green">{item.label}</span>
                        <span className="mt-0.5 block text-[11px] text-offgrid-green/55">{item.description}</span>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsCollectionMenuOpen(true)}
              onMouseLeave={() => setIsCollectionMenuOpen(false)}
            >
              <button
                type="button"
                onClick={() => handleNavigate("/collections")}
                className={cn(
                  headerNavLinkClass,
                  "cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                Collections
              </button>
              <AnimatePresence>
                {isCollectionMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    className={dropdownPanel}
                  >
                    {SHOP_BY_COLLECTION.map((item) => (
                      <button
                        key={item.label}
                        type="button"
                        onClick={() => handleNavigate(item.href)}
                        className="block w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-offgrid-green/80 hover:bg-offgrid-green/5 hover:text-offgrid-green"
                      >
                        <span className="font-semibold text-offgrid-green">{item.label}</span>
                        <span className="mt-0.5 block text-[11px] text-offgrid-green/55">{item.description}</span>
                      </button>
                    ))}
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>

            {navLinks.map((link) => (
              <button
                key={link.fullName}
                type="button"
                onClick={link.action}
                className={cn(
                  headerNavLinkClass,
                  "cursor-pointer",
                  navSolid ? "text-offgrid-cream/80" : "text-offgrid-cream/90",
                )}
              >
                {link.name}
              </button>
            ))}
          </nav>

          <div className="z-50 flex min-w-0 shrink-0 items-center gap-[clamp(0.25rem,1vw,0.75rem)] justify-self-end">
            <Button
              variant="secondary"
              size="sm"
              className="hidden min-h-11 px-[clamp(0.85rem,1.5vw,1.25rem)] text-[clamp(0.65rem,0.55rem+0.25vw,0.75rem)] xl:inline-flex"
              onClick={() => handleNavigate("/shop?category=Ultimate Frisbee")}
            >
              Shop Ultimate
            </Button>

            {currentUser ? (
              <NotificationBell
                variant="dark"
                className="shrink-0"
                settingsHref={
                  currentUser.role === "customer"
                    ? "/account/profile"
                    : currentUser.role === "admin"
                      ? "/portal/admin/settings"
                      : "/portal/staff"
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
                  "inline-flex min-h-11 items-center gap-2 rounded-full border px-2.5 py-2 text-sm font-semibold transition-colors sm:px-3",
                  onAccountRoute
                    ? "border-offgrid-lime bg-offgrid-lime/20 text-white"
                    : "border-offgrid-cream/35 text-offgrid-cream hover:border-white hover:text-white",
                )}
                title={currentUser ? "Account menu" : "Sign in"}
              >
                <UserRound className="h-4 w-4 shrink-0" />
                <span className="hidden max-w-[7rem] truncate 2xl:inline">{accountLabel}</span>
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
                aria-label="Cart"
                className={cn(headerIconBtn, "relative")}
              >
                <ShoppingBag className="h-5 w-5" />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-offgrid-lime text-[10px] font-bold text-white shadow-md"
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
                      "z-[60] rounded-2xl border border-offgrid-green/10 bg-offgrid-cream p-4 text-offgrid-green shadow-2xl",
                      "fixed inset-x-3 top-[calc(var(--og-header-height,4.5rem)+0.5rem)] w-auto",
                      "sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80",
                    )}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <p className="font-display text-sm font-bold">Cart Preview</p>
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
                        <div className="mt-2 flex items-center justify-between border-t border-offgrid-green/10 pt-2">
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
                        className="min-h-11 rounded-xl border border-offgrid-green/20 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-offgrid-green/5"
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
                        className="min-h-11 rounded-xl bg-offgrid-green px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-offgrid-cream transition-colors hover:bg-offgrid-dark"
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
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
              className={cn(headerIconBtn, "xl:hidden")}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 flex flex-col bg-offgrid-green px-4 pt-[calc(var(--og-header-height,4.5rem)+0.75rem)] pb-[env(safe-area-inset-bottom,0px)] sm:px-6"
          >
            <nav className="flex flex-1 flex-col gap-8 overflow-y-auto text-center">
              <button
                type="button"
                onClick={() => handleNavigate("/custom/order")}
                className={mobileNavPrimary}
              >
                Custom Order
              </button>

              <div className="flex flex-col gap-3">
                <p className={cn(sectionEyebrowOnDark, "mb-0 text-center")}>Shop By Sport</p>
                <div className="flex flex-col gap-1">
                  {sportLinks.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavigate(item.href)}
                      className={mobileNavSecondary}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => handleNavigate("/collections")}
                  className={cn(sectionEyebrowOnDark, "mb-0 text-center transition-colors hover:text-white")}
                >
                  Shop By Collection
                </button>
                <div className="flex flex-col gap-1">
                  {SHOP_BY_COLLECTION.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleNavigate(item.href)}
                      className={mobileNavSecondary}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.fullName}
                    type="button"
                    onClick={link.action}
                    className={mobileNavPrimary}
                  >
                    {link.fullName}
                  </button>
                ))}
              </div>

              <div className="mx-auto w-full max-w-xs border-t border-offgrid-cream/15 pt-6">
                <p className={cn(sectionEyebrowOnDark, "mb-3 text-center")}>Account</p>
                <div className="flex flex-col gap-2">{renderMobileAccountItems()}</div>
              </div>
            </nav>

            <div className="shrink-0 border-t border-offgrid-cream/15 px-2 py-5">
              <Button
                variant="secondary"
                size="lg"
                className="mx-auto w-full max-w-xs"
                onClick={() => handleNavigate("/shop?category=Ultimate Frisbee")}
              >
                Shop Ultimate
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
