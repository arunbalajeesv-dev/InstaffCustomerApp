-- Each user's current FCM device token, kept in sync by
-- src/services/notifications.ts on login. The backend (see the
-- send-booking-notification edge function) targets push notifications at
-- this. The "on booking created, send a push" trigger itself is wired up
-- separately as a Database Webhook (Database → Webhooks in the dashboard),
-- since the supabase_functions/pg_net plumbing it depends on is provisioned
-- by that UI rather than available to plain SQL migrations on this project.

alter table public.users
  add column if not exists fcm_token text;
