'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import ReservationForm from '@/components/reservation-form';
import { PriceOffer, SearchParams, ReservationFormData } from '@/lib/types';

interface ReservationPageProps {
  params: {
    offerId: string;
  };
}

export default function ReservationPage({ params }: ReservationPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [selectedOffer, setSelectedOffer] = useState<PriceOffer | null>(null);
  const [searchParamsData, setSearchParamsData] = useState<SearchParams | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [reservationResult, setReservationResult] = useState<{
    success: boolean;
    reservationId?: number;
    finalPrice?: number;
    currency?: string;
    error?: string;
    priceChanged?: boolean;
    priceError?: boolean;
    oldPrice?: number;
    newPrice?: number;
  } | null>(null);

  // Parse URL parameters - only run once
  useEffect(() => {
    if (isInitialized) return;

    try {
      // Get offer data from URL parameters
      const offerData = searchParams.get('offer');
      const searchData = searchParams.get('search');
      
      if (offerData && searchData) {
        const offer = JSON.parse(decodeURIComponent(offerData));
        const search = JSON.parse(decodeURIComponent(searchData));
        
        setSelectedOffer(offer);
        setSearchParamsData(search);
        setIsInitialized(true);
      } else {
        // If no URL params, create mock data for testing
        console.warn('No URL parameters found, creating mock data for testing');
        
        const mockOffer: PriceOffer = {
          id: params.offerId,
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

        setSelectedOffer(mockOffer);
        setSearchParamsData(mockSearchParams);
        setIsInitialized(true);
      }
    } catch (error) {
      console.error('Error parsing URL parameters:', error);
      setIsInitialized(true);
      // Don't redirect, show error instead
    }
  }, [params.offerId, searchParams, isInitialized]);

  // Handle reservation submission
  const handleReservationSubmit = async (formData: ReservationFormData) => {
    if (!selectedOffer || !searchParamsData) return;

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/create-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedOffer,
          searchParams: searchParamsData,
          formData
        }),
      });

      const result = await response.json();

      if (result.success) {
        setReservationResult({
          success: true,
          reservationId: result.reservationId,
          finalPrice: result.finalPrice,
          currency: result.currency
        });
      } else if (result.priceChanged || result.priceError) {
        // Handle price change
        setReservationResult({
          success: false,
          priceChanged: result.priceChanged,
          priceError: result.priceError,
          oldPrice: result.oldPrice,
          newPrice: result.newPrice,
          error: result.message || result.error
        });
      } else {
        setReservationResult({
          success: false,
          error: result.error || 'Rezervasyon oluşturulamadı'
        });
      }
    } catch (error) {
      console.error('Reservation submission error:', error);
      setReservationResult({
        success: false,
        error: 'Bir hata oluştu. Lütfen tekrar deneyin.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle price change confirmation
  const handlePriceChangeConfirm = () => {
    if (reservationResult?.newPrice && selectedOffer) {
      // Update the offer with new price
      const updatedOffer = {
        ...selectedOffer,
        "discounted-price": reservationResult.newPrice,
        price: reservationResult.newPrice
      };
      setSelectedOffer(updatedOffer);
      setReservationResult(null);
    }
  };

  // Handle refresh prices
  const handleRefreshPrices = () => {
    // Redirect back to reservation page to get fresh prices
    router.back();
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
  if (reservationResult?.success) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-600">
                Rezervasyon Başarılı!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-lg">
                Rezervasyonunuz başarıyla oluşturuldu.
              </p>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="font-semibold">Rezervasyon Numarası:</p>
                <p className="text-2xl font-bold text-green-600">
                  #{reservationResult.reservationId}
                </p>
                {reservationResult.finalPrice && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Final Fiyat:</p>
                    <p className="text-lg font-semibold">
                      {reservationResult.finalPrice.toLocaleString('tr-TR')} {reservationResult.currency}
                    </p>
                  </div>
                )}
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Rezervasyon detayları e-posta adresinize gönderilecektir.</p>
                <p>• Ödeme işlemlerini otel ile koordine edebilirsiniz.</p>
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

  // Price change state
  if (reservationResult?.priceChanged || reservationResult?.priceError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <DollarSign className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-2xl text-orange-600">
                Fiyat Değişikliği
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {reservationResult.error}
                </AlertDescription>
              </Alert>
              
              {reservationResult.oldPrice && reservationResult.newPrice && (
                <div className="bg-orange-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Eski Fiyat:</p>
                      <p className="text-lg font-semibold line-through text-gray-500">
                        {reservationResult.oldPrice.toLocaleString('tr-TR')} {selectedOffer.currency}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Yeni Fiyat:</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {reservationResult.newPrice.toLocaleString('tr-TR')} {selectedOffer.currency}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={handleRefreshPrices} 
                  variant="outline" 
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Fiyatları Yenile
                </Button>
                {reservationResult.newPrice && (
                  <Button 
                    onClick={handlePriceChangeConfirm}
                    className="flex-1"
                  >
                    Yeni Fiyatı Onayla
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (reservationResult?.error && !reservationResult.priceChanged && !reservationResult.priceError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-2xl text-red-600">
                Rezervasyon Başarısız
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {reservationResult.error}
                </AlertDescription>
              </Alert>
              <div className="flex gap-4 mt-6">
                <Button 
                  onClick={() => setReservationResult(null)} 
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
          <h1 className="text-3xl font-bold mb-2">Rezervasyon Formu</h1>
          <p className="text-gray-600">
            Rezervasyonunuzu tamamlamak için aşağıdaki bilgileri doldurun
          </p>
          
          {/* Price Warning */}
          <Alert className="max-w-2xl mx-auto mt-4">
            <DollarSign className="h-4 w-4" />
            <AlertDescription>
              <strong>Önemli:</strong> Fiyatlar dinamik olarak değişebilir. Rezervasyon sırasında güncel fiyat kontrol edilecektir.
            </AlertDescription>
          </Alert>
        </div>

        {/* Reservation Form */}
        <ReservationForm
          selectedOffer={selectedOffer}
          searchParams={searchParamsData}
          onSubmit={handleReservationSubmit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
