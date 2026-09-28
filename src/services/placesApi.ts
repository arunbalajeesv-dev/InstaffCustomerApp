import { supabase } from './supabase';

export type PlacePrediction = {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
};

export type PlaceDetails = {
  formattedAddress: string;
  latitude: number;
  longitude: number;
};

// A session token groups one search (however many keystrokes) together with
// the details lookup that follows it, so Google bills it as a single session
// instead of per-request. Not security-sensitive — just a correlation id.
export function createSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export async function autocompletePlaces(
  input: string,
  sessionToken: string,
): Promise<PlacePrediction[]> {
  const { data, error } = await supabase.functions.invoke('places', {
    body: { action: 'autocomplete', input, sessionToken },
  });
  if (error) {
    throw new Error(error.message);
  }
  return (data?.predictions ?? []) as PlacePrediction[];
}

export async function getPlaceDetails(
  placeId: string,
  sessionToken: string,
): Promise<PlaceDetails> {
  const { data, error } = await supabase.functions.invoke('places', {
    body: { action: 'details', placeId, sessionToken },
  });
  if (error || !data) {
    throw new Error(error?.message ?? 'Failed to load address details');
  }
  return data as PlaceDetails;
}
