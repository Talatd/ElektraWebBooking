import { NextResponse } from 'next/server';

const API_BASE_URL = 'https://bookingapi.elektraweb.com';
const HOTEL_ID = '23155';

export async function GET() {
  try {
    const token = process.env.ELEKTRA_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
    }

    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/params?language=TR`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({ 
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText 
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Failed to fetch hotel parameters',
      details: error.message 
    }, { status: 500 });
  }
}
