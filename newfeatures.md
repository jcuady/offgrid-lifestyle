Full E-Commerce Transaction Flow
Implement a complete shopping experience with product modals, cart, checkout, and order confirmation — all client-side using Zustand for state management. No database.

Proposed Changes
1. Install Zustand
bash
npm install zustand
State Management (Zustand)
[NEW] 
store.ts
Central Zustand store managing:

Product catalog — All products with full details (descriptions, sizes, colors with readable names, stock)
Cart state — Items array with { productId, name, image, price, size, color, quantity }, add/remove/update/clear actions
Cart UI — isCartOpen toggle for sidebar drawer
Product modal — selectedProduct for detail modal
Checkout state — Multi-step checkout flow tracking:
Step 1: Shipping info (name, email, phone, address, city, zip)
Step 2: Payment (COD, GCash, card — simulated)
Step 3: Order confirmation with order number
Order state — isCheckoutOpen, checkoutStep, shippingInfo, paymentMethod, orderId
Product Data
[NEW] 
products.ts
Centralized product data with enriched details:

Full descriptions, material info, fit details
Sizes: ["XS", "S", "M", "L", "XL", "2XL"]
Named colors: [{ name: "Cream", value: "bg-offgrid-cream" }, ...]
All products ₱1,100
Both BestSellers.tsx and the product modal will import from this shared source.

New UI Components
[NEW] 
ProductModal.tsx
Full-screen overlay modal when a product is clicked:

Large product image on the left
Product details on the right: name, category, price, description
Size selector — pill buttons, selected state uses bg-offgrid-green text-offgrid-cream
Color selector — circles with border highlight on selected
Quantity — +/- stepper
"Add to Cart" button (primary green CTA)
Material & fit details accordion
Animated entrance/exit via Framer Motion
Close with X button or backdrop click
[NEW] 
CartDrawer.tsx
Slide-in drawer from the right side:

Header: "Your Cart" + item count + close button
Cart items list with image thumbnail, name, size, color, quantity stepper, remove button, line total
Sticky footer: subtotal, shipping note ("Free shipping over ₱2,000"), "Checkout" CTA button
Empty state: icon + "Your cart is empty" + "Shop Now" button
Animated slide-in/out with backdrop overlay
[NEW] 
CheckoutModal.tsx
Full-screen checkout flow with 3 steps:

Step indicator — horizontal progress bar: Shipping → Payment → Confirmation

Step 1 — Shipping:

Form fields: Full name, Email, Phone, Address, City, Province, ZIP
Input styling: rounded borders, focus:ring-offgrid-green
"Continue to Payment" button
Order summary sidebar (on desktop)
Step 2 — Payment:

Payment method selection: COD, GCash, Credit/Debit Card (simulated)
Radio-card selection with icons
If card selected: card number, expiry, CVV fields (simulated, no real processing)
Order summary with itemized list
"Place Order" button
Step 3 — Confirmation:

✅ Success checkmark animation
Generated order number (e.g., OG-2026-XXXX)
Order summary recap
Estimated delivery: 3-5 business days
"Continue Shopping" button that clears cart & closes modal
Modified Components
[MODIFY] 
BestSellers.tsx
Import products from centralized data/products.ts
Product card click → opens ProductModal via Zustand setSelectedProduct()
"Quick Add" button → adds to cart directly (default size M, first color) via Zustand
[MODIFY] 
Navbar.tsx
Cart icon click → toggles CartDrawer via Zustand toggleCart()
Cart badge: show item count bubble when cart has items (animated)
[MODIFY] 
App.tsx
Mount ProductModal, CartDrawer, and CheckoutModal at root level
These components self-manage visibility via Zustand state
Design Consistency
All new components will follow the existing design system:

Token	Value	Usage
font-display	Playfair Display	Headings, product names, prices
font-sans	Inter	Body text, form labels, buttons
offgrid-green	#0F2F2F	Primary text, buttons, backgrounds
offgrid-cream	#F5F5F0	Light backgrounds, button text
offgrid-lime	#C5D330	Accents, highlights, success states
offgrid-dark	#0A1F1F	Dark backgrounds
offgrid-gold	#D4A853	Premium accents
Rounded corners	rounded-2xl	Cards, modals
Rounded buttons	rounded-full	All buttons
Label style	text-[10px] tracking-[0.2em] uppercase font-semibold	Section labels
Verification Plan
Automated
npx tsc --noEmit — TypeScript compilation check
npm run build — Production build verification
Manual (browser)
Click product → modal opens with full details
Select size/color → visual feedback
Add to cart → cart badge updates on navbar
Open cart drawer → see items, adjust quantities
Proceed to checkout → complete 3-step flow
Place order → see confirmation with order number