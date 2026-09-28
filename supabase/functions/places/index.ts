// Proxies Google Places Autocomplete + Place Details (Places API (New)) so
// the Google API key stays a server-side secret and never ships inside the
// app bundle.
//
// Deploy: supabase functions deploy places
// Requires the secret to be set first:
//   supabase secrets set GOOGLE_PLACES_API_KEY=<your-key> --project-ref yvrfiwnzuotbdflnntqy

const GOOGLE_PLACES_API_KEY = Deno.env.get('GOOGLE_PLACES_API_KEY')!;

type AutocompleteRequest = { action: 'autocomplete'; input: string; sessionToken?: string };
type DetailsRequest = { action: 'details'; placeId: string; sessionToken?: string };

type GoogleSuggestion = {
  placePrediction?: {
    placeId: string;
    text?: { text?: string };
    structuredFormat?: {
      mainText?: { text?: string };
      secondaryText?: { text?: string };
    };
  };
};

Deno.serve(async req => {
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let body: AutocompleteRequest | DetailsRequest;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (body.action === 'autocomplete') {
    return handleAutocomplete(body);
  }
  if (body.action === 'details') {
    return handleDetails(body);
  }
  return json({ error: 'Unknown action' }, 400);
});

async function handleAutocomplete(body: AutocompleteRequest): Promise<Response> {
  const input = body.input?.trim();
  if (!input) {
    return json({ predictions: [] });
  }

  const res = await fetch('https://places.googleapis.com/v1/places:autocomplete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
    },
    body: JSON.stringify({
      input,
      sessionToken: body.sessionToken,
      // This app is India-only today (GST-based pricing, +91 phone auth),
      // so suggestions are restricted to India for relevance.
      includedRegionCodes: ['in'],
    }),
  });
  const data = await res.json();
  if (!res.ok) {
    return json({ error: data.error?.message ?? 'Autocomplete failed' }, 502);
  }

  const predictions = ((data.suggestions ?? []) as GoogleSuggestion[])
    .filter(s => s.placePrediction)
    .map(s => {
      const p = s.placePrediction!;
      return {
        placeId: p.placeId,
        description: p.text?.text ?? '',
        mainText: p.structuredFormat?.mainText?.text ?? p.text?.text ?? '',
        secondaryText: p.structuredFormat?.secondaryText?.text ?? '',
      };
    });
  return json({ predictions });
}

async function handleDetails(body: DetailsRequest): Promise<Response> {
  const placeId = body.placeId?.trim();
  if (!placeId) {
    return json({ error: 'placeId is required' }, 400);
  }

  const url = new URL(`https://places.googleapis.com/v1/places/${placeId}`);
  if (body.sessionToken) {
    url.searchParams.set('sessionToken', body.sessionToken);
  }

  const res = await fetch(url, {
    headers: {
      'X-Goog-Api-Key': GOOGLE_PLACES_API_KEY,
      'X-Goog-FieldMask': 'formattedAddress,location',
    },
  });
  const data = await res.json();
  if (!res.ok) {
    return json({ error: data.error?.message ?? 'Details lookup failed' }, 502);
  }

  const location = data.location;
  if (typeof location?.latitude !== 'number' || typeof location?.longitude !== 'number') {
    return json({ error: 'Place details did not include a location' }, 502);
  }

  return json({
    formattedAddress: data.formattedAddress ?? '',
    latitude: location.latitude,
    longitude: location.longitude,
  });
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
