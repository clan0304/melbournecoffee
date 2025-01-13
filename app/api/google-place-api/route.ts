import { NextRequest, NextResponse } from 'next/server';

const BASE_URL = 'https://maps.googleapis.com/maps/api/place/textsearch/json?';
const GOOGLE_PLACE_KEY = process.env.GOOGLE_PLACE_API_KEY;

export const GET = async (req: NextRequest) => {
  const { searchParams } = new URL(req.url);
  const city = searchParams.get('q');

  const res = await fetch(
    BASE_URL + 'query=' + city + '&key=' + GOOGLE_PLACE_KEY,
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const resp = await res.json();

  return NextResponse.json({ resp });
};
