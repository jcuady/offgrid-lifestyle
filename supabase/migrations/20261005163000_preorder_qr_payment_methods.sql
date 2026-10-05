-- Allow 'bdo' payment method for BDO QR pre-orders and bank transfers.
ALTER TABLE public.og_orders
  DROP CONSTRAINT IF EXISTS og_orders_payment_method_check;

ALTER TABLE public.og_orders
  ADD CONSTRAINT og_orders_payment_method_check
  CHECK (payment_method IN ('cod', 'gcash', 'card', 'paymongo', 'bdo'));

COMMENT ON COLUMN public.og_orders.payment_method IS
  'Allowed: cod, gcash, card, paymongo, bdo (pre-order QR and bank transfer).';
