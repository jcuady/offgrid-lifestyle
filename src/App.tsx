/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense, useEffect } from "react";
import { hydratePaymentSettingsFromSupabase } from "@/src/services";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { ScrollToTop } from "./components/ScrollToTop";
import { RouteSeo } from "./components/seo/RouteSeo";
import { GoogleAnalytics } from "./components/seo/GoogleAnalytics";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { isAuthScreen, PORTAL_LOGIN_PATH } from "@/src/lib/authRoutes";
import { usePortalStore, getPortalLandingByRole } from "./store/usePortalStore";
import { RequirePortalRole } from "./components/portal/RequirePortalRole";
import { CookieConsentBanner } from "./components/consent/CookieConsentBanner";
import { PushPermissionPrompt } from "./components/notifications/PushPermissionPrompt";
import { PwaInstallModal } from "./components/pwa/PwaInstallModal";
import { PwaUpdateBanner } from "./components/pwa/PwaUpdateBanner";
import { CustomTeamOrderModal } from "./components/CustomTeamOrderModal";
import { initAuthListener } from "@/src/services/authService";

const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));
const ProductDetailPage = lazy(() =>
  import("./pages/ProductDetailPage").then((m) => ({ default: m.ProductDetailPage })),
);
const ShopPage = lazy(() => import("./pages/ShopPage").then((m) => ({ default: m.ShopPage })));
const CollectionsPage = lazy(() =>
  import("./pages/CollectionsPage").then((m) => ({ default: m.CollectionsPage })),
);
const EventsPage = lazy(() => import("./pages/EventsPage").then((m) => ({ default: m.EventsPage })));
const FaqPage = lazy(() => import("./pages/FaqPage").then((m) => ({ default: m.FaqPage })));
const TestimonialsPage = lazy(() =>
  import("./pages/TestimonialsPage").then((m) => ({ default: m.TestimonialsPage })),
);
const ContactPage = lazy(() => import("./pages/ContactPage").then((m) => ({ default: m.ContactPage })));
const AboutPage = lazy(() => import("./pages/AboutPage").then((m) => ({ default: m.AboutPage })));
const CustomOrderPage = lazy(() =>
  import("./pages/CustomOrderPage").then((m) => ({ default: m.CustomOrderPage })),
);
const CustomHubPage = lazy(() =>
  import("./pages/CustomHubPage").then((m) => ({ default: m.CustomHubPage })),
);
const CustomTemplatesPage = lazy(() =>
  import("./pages/CustomTemplatesPage").then((m) => ({ default: m.CustomTemplatesPage })),
);
const CustomSectionPage = lazy(() =>
  import("./pages/CustomSectionPage").then((m) => ({ default: m.CustomSectionPage })),
);
const LoginPage = lazy(() => import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })));
const CustomerSignInPage = lazy(() =>
  import("./pages/account/CustomerSignInPage").then((m) => ({ default: m.CustomerSignInPage })),
);
const CustomerSignUpPage = lazy(() =>
  import("./pages/account/CustomerSignUpPage").then((m) => ({ default: m.CustomerSignUpPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/account/ForgotPasswordPage").then((m) => ({ default: m.ForgotPasswordPage })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/account/ResetPasswordPage").then((m) => ({ default: m.ResetPasswordPage })),
);
const PortalLoginPage = lazy(() =>
  import("./pages/portal/PortalLoginPage").then((m) => ({ default: m.PortalLoginPage })),
);
const PortalOrderRedirect = lazy(() =>
  import("./components/portal/PortalOrderRedirect").then((m) => ({ default: m.PortalOrderRedirect })),
);
const PortalLayout = lazy(() =>
  import("./components/portal/PortalLayout").then((m) => ({ default: m.PortalLayout })),
);
const CustomerOrdersPage = lazy(() =>
  import("./pages/portal/CustomerOrdersPage").then((m) => ({ default: m.CustomerOrdersPage })),
);
const CustomerProfilePage = lazy(() =>
  import("./pages/portal/CustomerProfilePage").then((m) => ({ default: m.CustomerProfilePage })),
);
const CustomerOrderDetailPage = lazy(() =>
  import("./pages/portal/CustomerOrderDetailPage").then((m) => ({
    default: m.CustomerOrderDetailPage,
  })),
);
const OperationsDashboardPage = lazy(() =>
  import("./pages/portal/OperationsDashboardPage").then((m) => ({
    default: m.OperationsDashboardPage,
  })),
);
const OperationsOrderDetailPage = lazy(() =>
  import("./pages/portal/OperationsOrderDetailPage").then((m) => ({
    default: m.OperationsOrderDetailPage,
  })),
);
const OperationsOrdersPage = lazy(() =>
  import("./pages/portal/OperationsOrdersPage").then((m) => ({ default: m.OperationsOrdersPage })),
);
const OperationsAnalyticsPage = lazy(() =>
  import("./pages/portal/OperationsAnalyticsPage").then((m) => ({
    default: m.OperationsAnalyticsPage,
  })),
);
const AdminProductsPage = lazy(() =>
  import("./pages/portal/AdminProductsPage").then((m) => ({ default: m.AdminProductsPage })),
);
const AdminEventsPage = lazy(() =>
  import("./pages/portal/AdminEventsPage").then((m) => ({ default: m.AdminEventsPage })),
);
const AdminPaymentsPage = lazy(() =>
  import("./pages/portal/AdminPaymentsPage").then((m) => ({ default: m.AdminPaymentsPage })),
);
const AdminCustomContentPage = lazy(() =>
  import("./pages/portal/AdminCustomContentPage").then((m) => ({
    default: m.AdminCustomContentPage,
  })),
);
const AdminLandingPage = lazy(() =>
  import("./pages/portal/AdminLandingPage").then((m) => ({ default: m.AdminLandingPage })),
);
const AdminCustomPagesPage = lazy(() =>
  import("./pages/portal/AdminCustomPagesPage").then((m) => ({ default: m.AdminCustomPagesPage })),
);
const AdminStaffPage = lazy(() =>
  import("./pages/portal/AdminStaffPage").then((m) => ({ default: m.AdminStaffPage })),
);
const AdminAuditLogsPage = lazy(() =>
  import("./pages/portal/AdminAuditLogsPage").then((m) => ({ default: m.AdminAuditLogsPage })),
);
const AdminSettingsPage = lazy(() =>
  import("./pages/portal/AdminSettingsPage").then((m) => ({ default: m.AdminSettingsPage })),
);
const AdminReviewsPage = lazy(() =>
  import("./pages/portal/AdminReviewsPage").then((m) => ({ default: m.AdminReviewsPage })),
);
const AdminTestimonialsPage = lazy(() =>
  import("./pages/portal/AdminTestimonialsPage").then((m) => ({ default: m.AdminTestimonialsPage })),
);
const TermsPage = lazy(() =>
  import("./pages/LegalPages").then((m) => ({ default: m.TermsPage })),
);
const PrivacyPage = lazy(() =>
  import("./pages/LegalPages").then((m) => ({ default: m.PrivacyPage })),
);
const NotFoundPage = lazy(() =>
  import("./pages/NotFoundPage").then((m) => ({ default: m.NotFoundPage })),
);

function PortalIndexRedirect() {
  const user = usePortalStore((state) => state.currentUser);
  if (!user) return <Navigate to={PORTAL_LOGIN_PATH} replace />;
  return <Navigate to={getPortalLandingByRole(user.role)} replace />;
}

export default function App() {
  useEffect(() => {
    initAuthListener();
    void hydratePaymentSettingsFromSupabase();
  }, []);

  return (
    <Router>
      <AppFrame />
    </Router>
  );
}

function AppFrame() {
  const location = useLocation();
  const hideStorefrontChrome =
    location.pathname.startsWith("/portal") || isAuthScreen(location.pathname);

  return (
    <div className="min-h-screen bg-offgrid-cream font-sans text-offgrid-green overflow-x-hidden">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-offgrid-lime focus:px-4 focus:py-3 focus:text-sm focus:font-bold focus:text-offgrid-cream focus:shadow-lg"
      >
        Skip to main content
      </a>
      <RouteSeo />
      <GoogleAnalytics />
      <ScrollToTop />
      {!hideStorefrontChrome && <Navbar />}
      <Suspense
        fallback={
          <div className="mx-auto max-w-6xl px-6 pb-16 pt-28 sm:px-8 sm:pt-32 lg:px-10 text-sm text-offgrid-green/60">
            Loading page...
          </div>
        }
      >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/collections" element={<Navigate to="/og-signatures" replace />} />
        <Route path="/og-signatures" element={<CollectionsPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
        <Route path="/community" element={<EventsPage />} />
        <Route path="/events" element={<Navigate to="/community" replace />} />
        <Route path="/faq" element={<FaqPage />} />
        <Route path="/testimonials" element={<TestimonialsPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/legal/terms" element={<TermsPage />} />
        <Route path="/legal/privacy" element={<PrivacyPage />} />
        <Route path="/custom/order" element={<CustomOrderPage />} />
        <Route path="/custom/templates" element={<CustomTemplatesPage />} />
        <Route path="/custom" element={<CustomHubPage />} />
        <Route path="/custom/:slug" element={<CustomSectionPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/account/sign-in" element={<CustomerSignInPage />} />
        <Route path="/account/sign-up" element={<CustomerSignUpPage />} />
        <Route path="/account/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/account/reset-password" element={<ResetPasswordPage />} />
        <Route path="/portal/login" element={<PortalLoginPage />} />
        <Route path="/portal/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/portal/orders/:orderId" element={<PortalOrderRedirect />} />
        <Route path="/portal" element={<PortalIndexRedirect />} />
        <Route
          path="/account/orders"
          element={
            <RequirePortalRole roles={["customer"]}>
              <CustomerOrdersPage />
            </RequirePortalRole>
          }
        />
        <Route
          path="/account/profile"
          element={
            <RequirePortalRole roles={["customer"]}>
              <CustomerProfilePage />
            </RequirePortalRole>
          }
        />
        <Route
          path="/account/orders/:orderId"
          element={
            <RequirePortalRole roles={["customer"]}>
              <CustomerOrderDetailPage />
            </RequirePortalRole>
          }
        />
        <Route path="/account" element={<Navigate to="/account/orders" replace />} />
        <Route path="/portal/customer" element={<Navigate to="/account/orders" replace />} />
        <Route path="/portal/customer/orders" element={<Navigate to="/account/orders" replace />} />
        <Route path="/portal/customer/profile" element={<Navigate to="/account/profile" replace />} />

        <Route
          path="/portal/admin"
          element={
            <RequirePortalRole roles={["admin"]}>
              <PortalLayout role="admin" />
            </RequirePortalRole>
          }
        >
          <Route index element={<OperationsDashboardPage role="admin" />} />
          <Route path="homepage" element={<AdminLandingPage />} />
          <Route path="custom-pages" element={<AdminCustomPagesPage />} />
          <Route path="orders" element={<OperationsOrdersPage role="admin" />} />
          <Route path="orders/:orderId" element={<OperationsOrderDetailPage />} />
          <Route path="analytics" element={<OperationsAnalyticsPage role="admin" />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="staff" element={<AdminStaffPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          <Route path="custom-content" element={<AdminCustomContentPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="testimonials" element={<AdminTestimonialsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route
          path="/portal/staff"
          element={
            <RequirePortalRole roles={["staff"]}>
              <PortalLayout role="staff" />
            </RequirePortalRole>
          }
        >
          <Route index element={<OperationsDashboardPage role="staff" />} />
          <Route path="orders" element={<OperationsOrdersPage role="staff" />} />
          <Route path="orders/:orderId" element={<OperationsOrderDetailPage />} />
          <Route path="analytics" element={<OperationsAnalyticsPage role="staff" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>

      {!hideStorefrontChrome && <Footer />}

      <CartDrawer />
      <CheckoutModal />
      <CustomTeamOrderModal />
      <PwaInstallModal />
      <PwaUpdateBanner />
      <CookieConsentBanner />
      <PushPermissionPrompt />
    </div>
  );
}
