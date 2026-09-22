// Re-validates that every cart item's chosen slot is still free before
// letting checkout proceed. A slot is taken if another CONFIRMED (paid)
// booking already has an overlapping time range for the same service —
// pending/abandoned checkouts never became real bookings, so they don't
// block anyone else.
//
// Deploy: supabase functions deploy validate-slots
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY are auto-injected by Supabase at
// runtime — nothing to configure.)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type RequestItem = {
  itemId: string;
  serviceId: string;
  scheduledDate: string; // yyyy-mm-dd
  startTime: string; // HH:MM:00
  endTime: string; // HH:MM:00
};

Deno.serve(async req => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let items: RequestItem[];
  try {
    const body = await req.json();
    items = Array.isArray(body?.items) ? body.items : [];
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (items.length === 0) {
    return new Response(JSON.stringify({ results: [] }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const results = await Promise.all(
    items.map(async item => {
      const { data, error } = await supabase
        .from('booking_items')
        .select('id, bookings!inner(payment_status)')
        .eq('service_id', item.serviceId)
        .eq('scheduled_date', item.scheduledDate)
        .lt('start_time', item.endTime)
        .gt('end_time', item.startTime)
        .eq('bookings.payment_status', 'test_mode_paid');

      if (error) {
        return { itemId: item.itemId, available: false, error: error.message };
      }
      return { itemId: item.itemId, available: (data?.length ?? 0) === 0 };
    }),
  );

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
