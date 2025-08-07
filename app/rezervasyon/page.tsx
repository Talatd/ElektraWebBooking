import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Baby, TrendingUp, AlertTriangle } from 'lucide-react';

import { getHotelParams, getPriceOffers, getHotelDefinitions, buildSearchParams, groupPriceOffersByRoomType } from '@/lib/api';
import { SearchParams } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import RoomWithPricesCard from '@/components/room-with-prices-card';

interface ReservationPageProps {
  searchParams: {
    fromdate?: string;
    todate?: string;
    adult?: string;
    currency?: string;
    child1?: string;
    child2?: string;
    child3?: string;
    child4?: string;
    child5?: string;
    child6?: string;
  };
}

// Build search parameters from URL
function buildSearchParamsFromUrl(searchParams: ReservationPageProps['searchParams']): SearchParams | null {
  // Check for required parameters
  if (!searchParams.fromdate || !searchParams.todate) {
    console.log('Missing required date parameters:', { fromdate: searchParams.fromdate, todate: searchParams.todate });
    return null;
  }

  // Validate date format
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(searchParams.fromdate) || !dateRegex.test(searchParams.todate)) {
    console.log('Invalid date format:', { fromdate: searchParams.fromdate, todate: searchParams.todate });
    return null;
  }

  // Validate dates are not in the past
  const fromDate = new Date(searchParams.fromdate);
  const toDate = new Date(searchParams.todate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (fromDate < today) {
    console.log('From date is in the past:', searchParams.fromdate);
    return null;
  }

  if (toDate <= fromDate) {
    console.log('To date must be after from date:', { fromdate: searchParams.fromdate, todate: searchParams.todate });
    return null;
  }

  const children = [];
  for (let i = 1; i <= 6; i++) {
    const childAge = searchParams[`child${i}` as keyof typeof searchParams];
    if (childAge) {
      const age = parseInt(childAge);
      if (age >= 1 && age <= 17) {
        children.push({ age });
      }
    }
  }

  const adults = parseInt(searchParams.adult || '2');
  if (adults < 1 || adults > 8) {
    console.log('Invalid adult count:', adults);
    return null;
  }

  return {
    fromDate: searchParams.fromdate,
    toDate: searchParams.todate,
    adults,
    children
  };
}

// Loading component
function ReservationSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 bg-gray-200 rounded animate-pulse" />
      <div className="grid gap-4">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="h-64 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Server component for room offers with prices
async function RoomOffersWithPrices({ 
  searchParams, 
  currency 
}: { 
  searchParams: SearchParams; 
  currency: string;
}) {
  try {
    console.log('🔍 Loading room data and prices for reservation...');
    
    const [hotelData, roomDefinitions] = await Promise.all([
      getHotelParams('TR'),
      getHotelDefinitions('TR')
    ]);

    console.log('📊 Room definitions loaded:', {
      roomTypes: roomDefinitions.roomtype?.length || 0,
      boardTypes: roomDefinitions.boardtypes?.length || 0,
      rateTypes: roomDefinitions.ratetypes?.length || 0
    });

    // Get price offers
    let priceOffers = [];
    let priceError = null;
    
    try {
      priceOffers = await getPriceOffers(searchParams, currency, 'TR');
      console.log('💰 Price offers loaded successfully:', priceOffers.length);
    } catch (error) {
      console.warn('⚠️ Price offers failed:', error);
      priceError = error instanceof Error ? error.message : 'Bilinmeyen hata';
    }

    if (!roomDefinitions.roomtype || roomDefinitions.roomtype.length === 0) {
      return (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-4">Oda bilgileri bulunamadı</h2>
          <p className="text-gray-600 mb-6">
            Otel oda bilgileri yüklenirken bir sorun oluştu.
          </p>
          <Button asChild>
            <Link href="/">
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      );
    }

    // Group price offers by room type
    const roomsWithPrices = groupPriceOffersByRoomType(priceOffers, roomDefinitions.roomtype);
    
    console.log('🏨 Rooms with prices:', roomsWithPrices.length);

    return (
      <div className="space-y-8">
        {/* Hotel Header */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h1 className="text-2xl font-bold mb-2">{hotelData.name}</h1>
          <p className="text-gray-600">{hotelData.address}</p>
        </div>

        {/* Search Summary */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{searchParams.fromDate} - {searchParams.toDate}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{searchParams.adults} Yetişkin</span>
              </div>
              {searchParams.children.length > 0 && (
                <div className="flex items-center gap-2">
                  <Baby className="h-4 w-4" />
                  <span>{searchParams.children.length} Çocuk</span>
                </div>
              )}
              <Badge variant="outline">
                {roomDefinitions.roomtype.length} oda tipi
              </Badge>
              {priceOffers.length > 0 && (
                <Badge variant="default" className="bg-green-600">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {priceOffers.length} fiyat seçeneği
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Price Error Alert */}
        {priceError && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fiyat bilgileri yüklenemedi:</strong> {priceError}
              <br />
              <span className="text-sm text-gray-600">
                Oda bilgilerini görüntüleyebilirsiniz, ancak fiyat bilgileri mevcut değil.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Rooms with Prices */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Oda Tipleri ve Fiyatlar</h2>
            {priceOffers.length > 0 && (
              <Badge variant="secondary">
                {Math.ceil((new Date(searchParams.toDate).getTime() - new Date(searchParams.fromDate).getTime()) / (1000 * 60 * 60 * 24))} gece
              </Badge>
            )}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roomsWithPrices.map((roomWithPrices) => (
              <RoomWithPricesCard
                key={roomWithPrices.roomType["room-id"]}
                roomWithPrices={roomWithPrices}
                searchDates={{ fromDate: searchParams.fromDate, toDate: searchParams.toDate }}
              />
            ))}
          </div>
        </div>

        {/* Summary Statistics */}
        {priceOffers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Fiyat Özeti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded">
                  <div className="text-2xl font-bold text-blue-600">
                    {roomsWithPrices.filter(r => r.priceOffers.length > 0).length}
                  </div>
                  <div className="text-sm text-gray-600">Müsait Oda Tipi</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.min(...priceOffers.map(o => o["discounted-price"])).toLocaleString('tr-TR')} {currency}
                  </div>
                  <div className="text-sm text-gray-600">En Düşük Fiyat</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded">
                  <div className="text-2xl font-bold text-purple-600">
                    {priceOffers.filter(o => o["cancellation-penalty"]["is-refundable"]).length}
                  </div>
                  <div className="text-sm text-gray-600">İptal Edilebilir Seçenek</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error('❌ Error loading room offers:', error);
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold mb-4 text-red-600">Hata Oluştu</h2>
        <p className="text-gray-600 mb-4">
          Oda bilgileri yüklenirken bir hata oluştu.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Hata: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
        </p>
        <Button asChild>
          <Link href="/">
            Ana Sayfaya Dön
          </Link>
        </Button>
      </div>
    );
  }
}

export default async function ReservationPage({ searchParams }: ReservationPageProps) {
  const searchParamsData = buildSearchParamsFromUrl(searchParams);
  
  // Ensure currency is always valid
  let currency = searchParams.currency || 'TRY';
  const validCurrencies = ['EUR', 'USD', 'TRY']; // Removed 'TL'

  // Convert TL to TRY
  if (currency.toUpperCase() === 'TL') {
    currency = 'TRY';
  }

  if (!currency || currency.length < 3 || !validCurrencies.includes(currency.toUpperCase())) {
    console.warn(`Invalid currency ${currency}, defaulting to TRY`);
    currency = 'TRY';
  } else {
    currency = currency.toUpperCase();
  }
  
  console.log('💱 Using currency:', currency);
  
  // If no search parameters, redirect to home page or show search form
  if (!searchParamsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button variant="ghost" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Ana Sayfaya Dön
              </Link>
            </Button>
          </div>

          {/* Missing Parameters Message */}
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Rezervasyon Bilgileri Eksik</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Rezervasyon yapmak için önce tarih ve misafir bilgilerini belirtmeniz gerekiyor.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">Gerekli bilgiler:</p>
                <ul className="text-sm text-gray-500 space-y-1">
                  <li>• Giriş tarihi (YYYY-MM-DD formatında)</li>
                  <li>• Çıkış tarihi (YYYY-MM-DD formatında)</li>
                  <li>• Yetişkin sayısı (1-8 arası)</li>
                  <li>• Para birimi (EUR, USD, TL, TRY)</li>
                  <li>• Çocuk sayısı ve yaşları (varsa, 1-17 yaş arası)</li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800 font-medium">Örnek URL:</p>
                <code className="text-xs text-blue-700 break-all">
                  /rezervasyon?fromdate=2024-02-15&todate=2024-02-17&adult=2&currency=TRY
                </code>
              </div>
              <Button asChild className="mt-6">
                <Link href="/">
                  Rezervasyon Formu
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>

        {/* Room Offers with Prices */}
        <Suspense fallback={<ReservationSkeleton />}>
          <RoomOffersWithPrices searchParams={searchParamsData} currency={currency} />
        </Suspense>
      </div>
    </div>
  );
}

// Generate metadata
export async function generateMetadata() {
  try {
    const hotelData = await getHotelParams('TR');
    
    return {
      title: `${hotelData.name} Rezervasyon - Talat Booking`,
      description: `${hotelData.name} için oda seçenekleri ve rezervasyon imkanları. En uygun fiyatlarla rezervasyon yapın.`,
    };
  } catch (error) {
    return {
      title: 'Otel Rezervasyon - Talat Booking',
      description: 'Otel rezervasyon sayfası.',
    };
  }
}
