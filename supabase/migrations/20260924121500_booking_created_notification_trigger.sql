-- Fires the send-booking-notification edge function (server-side, via
-- pg_net's async HTTP) whenever a new booking is inserted — this is what
-- makes "when a booking is successfully created" a guarantee enforced by
-- the database, not something the client has to remember to call.

create extension if not exists pg_net with schema extensions;

create or replace function public.notify_booking_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform extensions.http_post(
    url := 'https://yvrfiwnzuotbdflnntqy.functions.supabase.co/send-booking-notification',
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('record', to_jsonb(new))
  );
  return new;
end;
$$;

drop trigger if exists on_booking_created on public.bookings;

create trigger on_booking_created
  after insert on public.bookings
  for each row
  execute function public.notify_booking_created();
