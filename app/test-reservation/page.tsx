'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function TestReservationPage() {
  const [fromDate, setFromDate] = useState('2024-02-15');
  const [toDate, setToDate] = useState('2024-02-17');
  const [adults, setAdults] = useState('2');
  const [currency, setCurrency] = useState('TRY');
  const [child1, setChild1] = useState('');
  const [child2, setChild2] = useState('');

  const generateUrl = () => {
    const params = new URLSearchParams({
      fromdate: fromDate,
      todate: toDate,
      adult: adults,
      currency: currency,
    });

    if (child1) params.append('child1', child1);
    if (child2) params.append('child2', child2);

    return `/rezervasyon?${params.toString()}`;
  };

  const testDirectly = async () => {
    const params = new URLSearchParams({
      fromdate: fromDate,
      todate: toDate,
      adult: adults,
      currency: currency,
    });

    if (child1) params.append('child1', child1);
    if (child2) params.append('child2', child2);

    try {
      const response = await fetch(`/api/test-price-offers?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        alert('API test successful! Check console for details.');
        console.log('API Response:', data);
      } else {
        alert(`API test failed: ${data.error}`);
        console.error('API Error:', data);
      }
    } catch (error) {
      alert(`Test failed: ${error}`);
      console.error('Test error:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Test Reservation Parameters</CardTitle>
          <p className="text-sm text-gray-600">
            Use this page to test different parameter combinations for the reservation page.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="adults">Adults (1-8)</Label>
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
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="USD">USD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="child1">Child 1 Age (optional)</Label>
              <Input
                id="child1"
                type="number"
                min="1"
                max="17"
                value={child1}
                onChange={(e) => setChild1(e.target.value)}
                placeholder="Leave empty if no child"
              />
            </div>
            <div>
              <Label htmlFor="child2">Child 2 Age (optional)</Label>
              <Input
                id="child2"
                type="number"
                min="1"
                max="17"
                value={child2}
                onChange={(e) => setChild2(e.target.value)}
                placeholder="Leave empty if no child"
              />
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded">
            <Label className="text-sm font-medium">Generated URL:</Label>
            <code className="text-xs break-all block mt-1 p-2 bg-white rounded border">
              {generateUrl()}
            </code>
          </div>

          <div className="flex gap-4">
            <Button onClick={testDirectly} variant="outline">
              Test API Directly
            </Button>
            <Button asChild>
              <Link href={generateUrl()}>
                Go to Reservation Page
              </Link>
            </Button>
          </div>

          <div className="text-sm text-gray-600 space-y-2">
            <p><strong>Valid Parameters:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>fromdate: YYYY-MM-DD format, not in the past</li>
              <li>todate: YYYY-MM-DD format, after fromdate</li>
              <li>adult: 1-8 (required)</li>
              <li>currency: EUR, USD, or TL (3 characters)</li>
              <li>child1-child6: 1-17 (optional)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
