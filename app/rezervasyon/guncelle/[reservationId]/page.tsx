'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import UpdateReservationForm from '@/components/update-reservation-form';
import { PriceOffer, SearchParams, UpdateReservationFormData } from '@/lib/types';

interface UpdateReservationPageProps {
  params: {
    reservationId: string;
  };
}

export default function UpdateReservationPage({ params }: UpdateReservationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedOffer, setSelectedOffer] = useState<PriceOffer | null>(null);
  const [searchParamsData, setSearchParamsData] = useState<SearchParams | null>(null);
  const [existingData, setExistingData] = useState<Partial<UpdateReservationFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [updateResult, setUpdateResult] = useState<{
    success: boolean;
    reservationId?: number;
    error?: string;
  } | null>(null);

  const reservationId = parseInt(params.reservationId);

  // Parse URL parameters - only run once
  useEffect(() => {
    if (isInitialized) return;

    try {
      // Get offer data from URL parameters
      const offerData = searchParams.get('offer');
      const searchData = searchParams.get('search');
      const existingDataParam = searchParams.get('existing');
      
      if (offerData && searchData) {
        const offer = JSON.parse(decodeURIComponent(offerData));
        const search = JSON.parse(decodeURIComponent(searchData));
        const existing = existingDataParam ? JSON.parse(decodeURIComponent(existingDataParam)) : null;
        
        setSelectedOffer(offer);
        setSearchParamsData(search);
        setExistingData(existing);
        setIsInitialized(true);
      } else {
        // Create mock data for testing
        console.warn('No URL parameters found, creating mock data for testing');
        
        const mockOffer: PriceOffer = {
          id: `update-${reservationId}`,
          "hotel-id": 23155,
          "room-type-id": 415228,
          "room-type": "Standard Room",
          "board-type-id": 46820,
          "board-type": "BB",
          "rate-type-id": 26769,
          "rate-type": "Refundable",
          "rate-code-id": 255808,
          "rate-code": "STD",
          "price-agency-id": 1,
          "room-tosell": 5,
          "stop-sell": false,
          "stop-sell-closed-to-arrival": false,
          "stop-sell-closed-to-departure": false,
          "min-los": null,
          "max-los": null,
          "bookable-after-days": null,
          price: 1500,
          "currency-id": 1,
          currency: "TRY",
          "commission-percent": 0,
          "discount-percent": 10,
          "discount-amount": 150,
          "promotion-percent": 0,
          "promotion-amount": 0,
          "discounted-price": 1350,
          "cancellation-penalty": {
            description: "Free cancellation until 24 hours before arrival",
            "period-in-days": 1,
            "penalty-percentage": 0,
            "is-refundable": true
          }
        };

        const mockSearchParams: SearchParams = {
          fromDate: "2025-08-08",
          toDate: "2025-08-12",
          adults: 2,
          children: []
        };

        const mockExistingData: Partial<UpdateReservationFormData> = {
          contactFirstName: "John",
          contactLastName: "Doe",
          contactEmail: "john.doe@example.com",
          contactPhone: "+905551234567",
          nationality: "TR",
          voucherNo: "ABC123456",
          promoCode: "SUMMER2024"
        };

        setSelectedOffer(mockOffer);
        setSearchParamsData(mockSearchParams);
        setExistingData(mockExistingData);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      setIsInitialized(true);
    }
  }, [params.reservationId, searchParams, isInitialized, reservationId]);

  // Handle reservation update submission
  const handleUpdateSubmit = async (formData: UpdateReservationFormData) => {
    if (!selectedOffer || !searchParamsData) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/update-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedOffer,
          searchParams: searchParamsData,
          formData,
          reservationId
        }),
      });

      const result = await response.json();

      if (result.success) {
        setUpdateResult({
          success: true,
          reservationId: result.reservationId
        });
      } else {
        setUpdateResult({
          success: false,
          error: result.error || 'Rezervasyon güncellenemedi'
        });
      }
    } catch (error) {
      console.error('Reservation update submission error:', error);
      setUpdateResult({
        success: false,
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Loading state
  if (!isInitialized || (!selectedOffer || !searchParamsData)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Rezervasyon bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Success state
  if (updateResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Rezervasyon Güncellendi!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">
                Rezervasyonunuz başarıyla güncellendi.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold">Rezervasyon Numarası:</p>
                <p className="text-2xl font-bold text-green-600">
                  #{updateResult.reservationId}
                </p>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Güncellenen rezervasyon detayları e-posta adresinize gönderilecektir.</p>
                <p>• Değişiklikler hemen geçerli olacaktır.</p>
                <p>• Herhangi bir sorunuz için bizimle iletişime geçebilirsiniz.</p>
              </div>
              <div className="flex gap-4 mt-6">
                <Button asChild variant="outline" className="flex-1">
                  <Link href="/">
                    Ana Sayfaya Dön
                  </Link>
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/rezervasyon">
                    Yeni Rezervasyon
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (updateResult?.error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Güncelleme Başarısız
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {updateResult.error}
                </AlertDescription>
              </Alert>
              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => setUpdateResult(null)} 
                  variant="outline" 
                  className="flex-1"
                >
                  Tekrar Dene
                </Button>
                <Button asChild className="flex-1">
                  <Link href="/rezervasyon">
                    Geri Dön
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Main form
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Button>
        </div>

        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Rezervasyon Güncelleme</h1>
          <p className="text-gray-600">
            Rezervasyon #{reservationId} bilgilerini güncelleyin
          </p>
        </div>

        {/* Update Reservation Form */}
        <UpdateReservationForm
          selectedOffer={selectedOffer}
          searchParams={searchParamsData}
          reservationId={reservationId}
          existingData={existingData || undefined}
          onSubmit={handleUpdateSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
