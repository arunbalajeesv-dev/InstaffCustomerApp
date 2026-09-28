// Sends the "Booking Confirmed!" push notification via FCM whenever a
// booking is inserted. Invoked server-side by the on_booking_created
// Postgres trigger (see supabase/migrations) — never called directly by the
// client, so this fires even if the app closes right after checkout.
//
// Deploy: supabase functions deploy send-booking-notification --no-verify-jwt
// (--no-verify-jwt because the caller is the database trigger, not a
// logged-in user, so there's no user JWT to verify.)
//
// Requires the secret to be set first — the full JSON key from Firebase
// Console → Project Settings → Service Accounts → Generate new private key:
//   supabase secrets set FIREBASE_SERVICE_ACCOUNT_KEY='<paste the whole JSON>' --project-ref yvrfiwnzuotbdflnntqy

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const FIREBASE_SERVICE_ACCOUNT_KEY = Deno.env.get('FIREBASE_SERVICE_ACCOUNT_KEY');
const FCM_SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

type ServiceAccount = {
  project_id: string;
  client_email: string;
  private_key: string;
};

type BookingRecord = { id: string; user_id: string };

Deno.serve(async req => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let record: BookingRecord;
  try {
    const body = await req.json();
    record = body.record;
    if (!record?.user_id) {
      throw new Error('missing record.user_id');
    }
  } catch {
    return json({ error: 'Invalid webhook payload' }, 400);
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  );

  const { data: user, error } = await supabase
    .from('users')
    .select('fcm_token')
    .eq('id', record.user_id)
    .maybeSingle();

  if (error) {
    return json({ error: error.message }, 500);
  }
  if (!user?.fcm_token) {
    // No device registered for push yet — not an error, just nothing to do.
    return json({ skipped: 'no fcm_token on file' });
  }

  if (!FIREBASE_SERVICE_ACCOUNT_KEY) {
    return json({ error: 'FIREBASE_SERVICE_ACCOUNT_KEY secret is not set' }, 500);
  }
  const serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY) as ServiceAccount;
  const accessToken = await getGoogleAccessToken(serviceAccount);

  const res = await fetch(
    `https://fcm.googleapis.com/v1/projects/${serviceAccount.project_id}/messages:send`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        message: {
          token: user.fcm_token,
          notification: {
            title: 'Booking Confirmed!',
            body: "We'll notify you once your professional is assigned.",
          },
        },
      }),
    },
  );

  if (!res.ok) {
    const errBody = await res.text();
    return json({ error: `FCM send failed: ${errBody}` }, 502);
  }

  return json({ sent: true });
});

// Exchanges the service account's private key for a short-lived Google
// OAuth2 access token (the standard JWT-bearer flow), using only Web
// Crypto — no firebase-admin/googleapis dependency, which keeps this
// reliable in the Deno edge runtime.
async function getGoogleAccessToken(serviceAccount: ServiceAccount): Promise<string> {
  const nowSeconds = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claims = {
    iss: serviceAccount.client_email,
    scope: FCM_SCOPE,
    aud: 'https://oauth2.googleapis.com/token',
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  };

  const encoder = new TextEncoder();
  const unsigned = `${base64url(encoder.encode(JSON.stringify(header)))}.${base64url(
    encoder.encode(JSON.stringify(claims)),
  )}`;

  const key = await crypto.subtle.importKey(
    'pkcs8',
    pemToArrayBuffer(serviceAccount.private_key),
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    key,
    encoder.encode(unsigned),
  );
  const jwt = `${unsigned}.${base64url(new Uint8Array(signature))}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`Failed to obtain Google access token: ${await tokenRes.text()}`);
  }
  const { access_token } = (await tokenRes.json()) as { access_token: string };
  return access_token;
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const base64 = pem
    .replace(/-----BEGIN PRIVATE KEY-----/, '')
    .replace(/-----END PRIVATE KEY-----/, '')
    .replace(/\s/g, '');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

function base64url(bytes: Uint8Array): string {
  let binary = '';
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
