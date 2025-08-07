'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function TestApiPage() {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Test form data
  const [fromDate, setFromDate] = useState('2024-02-15');
  const [toDate, setToDate] = useState('2024-02-17');
  const [adults, setAdults] = useState('2');
  const [currency, setCurrency] = useState('EUR');

  const testHotelParams = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/test-hotel-params');
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testPriceOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        fromdate: fromDate,
        todate: toDate,
        adult: adults,
        currency
      });

      const response = await fetch(`/api/test-price-offers?${params}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch');
      }
      setResults(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>API Test Page</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hotel Parameters Test */}
          <div>
            <Button onClick={testHotelParams} disabled={loading}>
              Test Hotel Parameters
            </Button>
          </div>

          {/* Price Offers Test */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Test Price Offers</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fromdate">From Date</Label>
                <Input
                  id="fromdate"
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="todate">To Date</Label>
                <Input
                  id="todate"
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="adults">Adults</Label>
                <Input
                  id="adults"
                  type="number"
                  min="1"
                  max="8"
                  value={adults}
                  onChange={(e) => setAdults(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full p-2 border rounded"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="TL">TL</option>
                </select>
              </div>
            </div>
            <Button onClick={testPriceOffers} disabled={loading}>
              Test Price Offers
            </Button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-4">
              <p>Loading...</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded p-4">
              <h4 className="font-semibold text-red-800">Error:</h4>
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {/* Results Display */}
          {results && (
            <div className="bg-gray-50 border rounded p-4">
              <h4 className="font-semibold mb-2">Results:</h4>
              <pre className="text-xs overflow-auto max-h-96">
                {JSON.stringify(results, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
