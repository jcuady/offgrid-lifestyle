-- Sibling of retail validate FOR UPDATE bug: stock is decremented on insert for
-- tracked products (stock IS NOT NULL), but cancel never restored it — and any
-- INVOKER restore would also fail anon/staff RLS on og_products (admin-only write).
-- Fix: SECURITY DEFINER restore when retail status first becomes cancelled.

CREATE OR REPLACE FUNCTION public.og_restore_retail_stock_on_cancel()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  line jsonb;
  qty int;
BEGIN
  IF NEW.order_type IS DISTINCT FROM 'retail' THEN
    RETURN NEW;
  END IF;

  IF NEW.status IS DISTINCT FROM 'cancelled' OR OLD.status IS NOT DISTINCT FROM 'cancelled' THEN
    RETURN NEW;
  END IF;

  IF NEW.line_items IS NULL
    OR jsonb_typeof(NEW.line_items) <> 'array' THEN
    RETURN NEW;
  END IF;

  FOR line IN SELECT value FROM jsonb_array_elements(NEW.line_items)
  LOOP
    qty := (line->>'quantity')::int;
    IF qty IS NULL OR qty < 1 THEN
      CONTINUE;
    END IF;

    -- null stock = unlimited and was never decremented on insert
    UPDATE public.og_products
    SET stock = stock + qty
    WHERE id = line->>'productId'
      AND stock IS NOT NULL;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS og_orders_restore_retail_stock_on_cancel ON public.og_orders;
CREATE TRIGGER og_orders_restore_retail_stock_on_cancel
  BEFORE UPDATE OF status ON public.og_orders
  FOR EACH ROW
  EXECUTE FUNCTION public.og_restore_retail_stock_on_cancel();

REVOKE ALL ON FUNCTION public.og_restore_retail_stock_on_cancel() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.og_restore_retail_stock_on_cancel() TO postgres, service_role;

COMMENT ON FUNCTION public.og_restore_retail_stock_on_cancel IS
  'SECURITY DEFINER: restores tracked product stock when a retail order is cancelled.';
