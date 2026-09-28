-- pg_net was already installed on this project under schema `net` (not
-- `extensions` as the earlier migration assumed) — fix the call site, and
-- drop the temporary introspection view used to discover that.

drop view if exists public.debug_pgnet_signature;

create or replace function public.notify_booking_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform net.http_post(
    'https://yvrfiwnzuotbdflnntqy.functions.supabase.co/send-booking-notification'::text,
    jsonb_build_object('record', to_jsonb(new)),
    '{}'::jsonb,
    '{"Content-Type": "application/json"}'::jsonb,
    5000
  );
  return new;
end;
$$;
