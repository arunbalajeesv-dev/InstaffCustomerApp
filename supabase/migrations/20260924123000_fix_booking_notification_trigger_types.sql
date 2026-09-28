-- The previous version's named-argument call to extensions.http_post()
-- failed to resolve (url passed as an untyped literal confused overload
-- resolution). Rewritten with explicit casts and positional arguments.

create or replace function public.notify_booking_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform extensions.http_post(
    'https://yvrfiwnzuotbdflnntqy.functions.supabase.co/send-booking-notification'::text,
    jsonb_build_object('record', to_jsonb(new)),
    '{}'::jsonb,
    '{"Content-Type": "application/json"}'::jsonb,
    5000
  );
  return new;
end;
$$;
