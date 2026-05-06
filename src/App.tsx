/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Hero } from "./components/Hero";
import { FeaturedCollections } from "./components/FeaturedCollections";
import { BestSellers } from "./components/BestSellers";
import { BrandStory } from "./components/BrandStory";
import { EventSection } from "./components/EventSection";
import { SocialProof } from "./components/SocialProof";
import { CTASection } from "./components/CTASection";
import { Footer } from "./components/Footer";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CartDrawer } from "./components/CartDrawer";
import { CheckoutModal } from "./components/CheckoutModal";
import { ShopPage } from "./pages/ShopPage";
import { EventsPage } from "./pages/EventsPage";
import { CustomOrderPage } from "./pages/CustomOrderPage";
import { CustomHubPage } from "./pages/CustomHubPage";
import { CustomTemplatesPage } from "./pages/CustomTemplatesPage";
import { CustomSectionPage } from "./pages/CustomSectionPage";
import { LoginPage } from "./pages/LoginPage";
import { usePortalStore, getPortalLandingByRole } from "./store/usePortalStore";
import { PortalLayout } from "./components/portal/PortalLayout";
import { RequirePortalRole } from "./components/portal/RequirePortalRole";
import { CustomerOrdersPage } from "./pages/portal/CustomerOrdersPage";
import { CustomerProfilePage } from "./pages/portal/CustomerProfilePage";
import { CustomerOrderDetailPage } from "./pages/portal/CustomerOrderDetailPage";
import { OperationsDashboardPage } from "./pages/portal/OperationsDashboardPage";
import { OperationsOrdersPage } from "./pages/portal/OperationsOrdersPage";
import { OperationsAnalyticsPage } from "./pages/portal/OperationsAnalyticsPage";
import { AdminProductsPage } from "./pages/portal/AdminProductsPage";
import { AdminEventsPage } from "./pages/portal/AdminEventsPage";
import { AdminCustomContentPage } from "./pages/portal/AdminCustomContentPage";

function HomePage() {
  return (
    <>
      <Hero />
      <main>
        <FeaturedCollections />
        <BestSellers />
        <BrandStory />
        <EventSection />
        <SocialProof />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

function PortalIndexRedirect() {
  const user = usePortalStore((state) => state.currentUser);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getPortalLandingByRole(user.role)} replace />;
}

export default function App() {
  return (
    <Router>
      <AppFrame />
    </Router>
  );
}

function AppFrame() {
  const location = useLocation();
  const isPortalScreen =
    location.pathname.startsWith("/portal") || location.pathname.startsWith("/login");

  return (
    <div className="min-h-screen bg-offgrid-cream font-sans text-offgrid-green overflow-x-hidden">
      {!isPortalScreen && <Navbar />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/shop/:slug" element={<ProductDetailPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/custom/order" element={<CustomOrderPage />} />
        <Route path="/custom/templates" element={<CustomTemplatesPage />} />
        <Route path="/custom" element={<CustomHubPage />} />
        <Route path="/custom/:slug" element={<CustomSectionPage />} />
        <Route path="/login" element={<LoginPage />} />
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
          <Route path="orders" element={<OperationsOrdersPage role="admin" />} />
          <Route path="analytics" element={<OperationsAnalyticsPage role="admin" />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="custom-content" element={<AdminCustomContentPage />} />
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
          <Route path="analytics" element={<OperationsAnalyticsPage role="staff" />} />
        </Route>
      </Routes>

      <CartDrawer />
      <CheckoutModal />
    </div>
  );
}
