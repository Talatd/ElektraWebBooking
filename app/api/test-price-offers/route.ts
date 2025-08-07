import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = 'https://bookingapi.elektraweb.com';
const HOTEL_ID = '23155';

export async function GET(request: NextRequest) {
  try {
    const token = process.env.ELEKTRA_API_TOKEN;
    if (!token) {
      return NextResponse.json({ error: 'API token not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const fromdate = searchParams.get('fromdate');
    const todate = searchParams.get('todate');
    const adult = searchParams.get('adult') || '2';
    let currency = searchParams.get('currency') || 'EUR';

    if (!fromdate || !todate) {
      return NextResponse.json({ error: 'fromdate and todate are required' }, { status: 400 });
    }

    // Validate and normalize currency
    const validCurrencies = ['EUR', 'USD', 'TL'];
    currency = currency.toUpperCase();
    
    if (!validCurrencies.includes(currency) || currency.length < 3) {
      currency = 'EUR';
    }

    const apiParams = new URLSearchParams({
      fromdate,
      todate,
      adult,
      currency,
      language: 'TR'
    });

    console.log('API Request:', `${API_BASE_URL}/hotel/${HOTEL_ID}/price?${apiParams.toString()}`);
    console.log('Parameters:', { fromdate, todate, adult, currency });

    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/price?${apiParams.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json({ 
        error: `API Error: ${response.status} ${response.statusText}`,
        details: errorText,
        requestUrl: `${API_BASE_URL}/hotel/${HOTEL_ID}/price?${apiParams.toString()}`,
        sentParameters: { fromdate, todate, adult, currency, language: 'TR' }
      }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Price offers error:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch price offers',
      details: error.message 
    }, { status: 500 });
  }
}
