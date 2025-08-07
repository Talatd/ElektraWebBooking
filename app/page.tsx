import { Suspense } from 'react';
import { MapPin, Phone, Mail, Globe, Wifi, Car, Utensils, Waves, Star, Users, Calendar, TrendingUp } from 'lucide-react';

import { getHotelParams } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BookingSearchForm from '@/components/booking-search-form';
import ImageGallery from '@/components/image-gallery';

// Loading component for the search form
function SearchFormSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3 mx-auto" />
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="h-12 bg-gray-200 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Facility icon mapping
const getFacilityIcon = (facilityName: string) => {
  const name = facilityName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4" />;
  if (name.includes('park') || name.includes('otopark')) return <Car className="h-4 w-4" />;
  if (name.includes('restoran') || name.includes('yemek')) return <Utensils className="h-4 w-4" />;
  if (name.includes('havuz') || name.includes('pool')) return <Waves className="h-4 w-4" />;
  return null;
};

export default async function HomePage() {
  let hotelData;
  
  try {
    console.log('🏠 HomePage: Loading hotel data from API...');
    hotelData = await getHotelParams('TR');
    console.log('✅ HomePage: Hotel data loaded successfully');
    console.log(`📸 Found ${hotelData.images?.length || 0} hotel images`);
  } catch (error) {
    console.error('❌ HomePage: Failed to load hotel data:', error);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Hata Oluştu
              </h2>
              <p className="text-gray-600">
                Otel bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="container mx-auto px-4">
          {/* Hotel Images - FROM API (22 images) */}
          <div className="mb-8">
            {hotelData.images && hotelData.images.length > 0 ? (
              <ImageGallery 
                images={hotelData.images} 
                className="max-w-6xl mx-auto"
              />
            ) : (
              <div className="max-w-6xl mx-auto h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Otel görselleri yükleniyor...</p>
              </div>
            )}
            
            {/* Image Count Display */}
            {hotelData.images && hotelData.images.length > 0 && (
              <div className="text-center mt-4">
                <Badge variant="secondary" className="text-sm">
                  📸 {hotelData.images.length} Görsel
                </Badge>
              </div>
            )}
          </div>

          {/* Hotel Header - FROM API */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {hotelData.name}
            </h1>
            <div className="flex items-center justify-center text-lg mb-4">
              <MapPin className="h-5 w-5 mr-2 text-gray-600" />
              <span className="text-gray-700">{hotelData.address}</span>
            </div>
            
            {/* Hotel Rating - FROM API if available, otherwise default */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="flex items-center">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-lg font-semibold">
                {hotelData.rating || '4.8'}
              </span>
              <Badge variant="secondary">
                {hotelData.reviewCount ? `${hotelData.reviewCount} değerlendirme` : 'Mükemmel'}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      {/* Search Form Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Suspense fallback={<SearchFormSkeleton />}>
            <BookingSearchForm />
          </Suspense>
        </div>
      </section>

      {/* Hotel Details Section - FROM API */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Hotel Description - FROM API */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">Otel Hakkında</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 leading-relaxed mb-6">
                    {hotelData.description || 
                      'Konforlu konaklama deneyimi sunan otelimiz, modern olanakları ve kaliteli hizmet anlayışı ile misafirlerine unutulmaz anlar yaşatmayı hedeflemektedir.'}
                  </p>

                  {/* Key Features */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Aile Dostu</h3>
                      <p className="text-sm text-gray-600">Çocuk dostu olanaklar</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Wifi className="h-8 w-8 text-green-600 mx-auto mb-2" />
                      <h3 className="font-semibold">Ücretsiz WiFi</h3>
                      <p className="text-sm text-gray-600">Tüm alanlarda hızlı internet</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                      <h3 className="font-semibold">En İyi Fiyat</h3>
                      <p className="text-sm text-gray-600">Fiyat garantisi</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Facilities - FROM API */}
              {hotelData.facilities && hotelData.facilities.length > 0 && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-2xl">Otel Olanakları</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {hotelData.facilities.map((facility) => (
                        <Badge 
                          key={facility.id} 
                          variant="secondary" 
                          className="flex items-center gap-2 p-3 justify-start"
                        >
                          {getFacilityIcon(facility.name)}
                          <span className="text-sm">{facility.name}</span>
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Contact Information - FROM API */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl">İletişim Bilgileri</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hotelData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Telefon</p>
                        <p className="text-gray-600">{hotelData.phone}</p>
                      </div>
                    </div>
                  )}

                  {hotelData.email && (
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">E-posta</p>
                        <p className="text-gray-600">{hotelData.email}</p>
                      </div>
                    </div>
                  )}

                  {hotelData.website && (
                    <div className="flex items-center gap-3">
                      <Globe className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Website</p>
                        <a 
                          href={hotelData.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {hotelData.website}
                        </a>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-1" />
                    <div>
                      <p className="font-medium">Adres</p>
                      <p className="text-gray-600">{hotelData.address}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Location Map - FROM API */}
              {hotelData.location && (
                <Card className="mt-6">
                  <CardHeader>
                    <CardTitle className="text-xl">Konum</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                      <p className="text-gray-500">Harita yükleniyor...</p>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">
                      Koordinatlar: {hotelData.location.latitude}, {hotelData.location.longitude}
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
