-- Realtime inbox: clients subscribe to og_notifications inserts/updates for their user_id.
ALTER PUBLICATION supabase_realtime ADD TABLE public.og_notifications;
