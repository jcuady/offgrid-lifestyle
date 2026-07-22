-- Allow customers to update their own profile fields (email sync after auth change, name, phone).
-- Staff already have og_portal_users_staff_update_self; admins use og_portal_users_admin_all.

DROP POLICY IF EXISTS og_portal_users_customer_update_self ON public.og_portal_users;

CREATE POLICY og_portal_users_customer_update_self
  ON public.og_portal_users
  FOR UPDATE
  TO authenticated
  USING (
    og_portal_role() = 'customer'
    AND auth_user_id = (SELECT auth.uid())
  )
  WITH CHECK (
    og_portal_role() = 'customer'
    AND auth_user_id = (SELECT auth.uid())
    AND role = 'customer'
    AND status = 'active'
  );
