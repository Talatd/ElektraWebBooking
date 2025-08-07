'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Users, Bed, Wifi, Shield, Bath, Wind, MapPin, Eye, ChevronLeft, ChevronRight, Calendar, CreditCard, AlertCircle, CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { RoomTypeWithPrices, PriceOffer } from '@/lib/types';

interface RoomWithPricesCardProps {
  roomWithPrices: RoomTypeWithPrices;
  searchDates: { fromDate: string; toDate: string };
  className?: string;
}

const getAmenityIcon = (amenityName: string) => {
  const name = amenityName.toLowerCase();
  if (name.includes('wifi') || name.includes('internet')) return <Wifi className="h-4 w-4" />;
  if (name.includes('safe')) return <Shield className="h-4 w-4" />;
  if (name.includes('bath')) return <Bath className="h-4 w-4" />;
  if (name.includes('air conditioning')) return <Wind className="h-4 w-4" />;
  return null;
};

const getBoardTypeDescription = (boardType: string) => {
  const descriptions: { [key: string]: string } = {
    'RO': 'Sadece Oda (Room Only)',
    'BB': 'Kahvaltı Dahil (Bed & Breakfast)',
    'HB': 'Yarım Pansiyon (Half Board)',
    'FB': 'Tam Pansiyon (Full Board)',
    'AI': 'Her Şey Dahil (All Inclusive)'
  };
  return descriptions[boardType] || boardType;
};

const calculateNights = (fromDate: string, toDate: string): number => {
  const from = new Date(fromDate);
  const to = new Date(toDate);
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
};

export default function RoomWithPricesCard({ roomWithPrices, searchDates, className }: RoomWithPricesCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<PriceOffer | null>(null);

  const { roomType, priceOffers, minPrice, maxPrice, currency } = roomWithPrices;
  const nights = calculateNights(searchDates.fromDate, searchDates.toDate);

  const nextImage = () => {
    if (roomType["room-images"].length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % roomType["room-images"].length);
    }
  };

  const prevImage = () => {
    if (roomType["room-images"].length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + roomType["room-images"].length) % roomType["room-images"].length);
    }
  };

  const displayImages = roomType["room-images"].length > 0 ? roomType["room-images"] : [roomType["room-image-url"]];

  const handleReservation = useCallback((offer: PriceOffer) => {
    // Encode the offer and search params for URL
    const offerData = encodeURIComponent(JSON.stringify(offer));
    const searchData = encodeURIComponent(JSON.stringify({
      fromDate: searchDates.fromDate,
      toDate: searchDates.toDate,
      adults: 2, // This should come from actual search params
      children: [] // This should come from actual search params
    }));
    
    // Navigate to reservation form
    window.location.href = `/rezervasyon/${offer.id}?offer=${offerData}&search=${searchData}`;
  }, [searchDates]);

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={displayImages[currentImageIndex] || '/placeholder.svg?height=200&width=300&text=Room'}
            alt={roomType["room-name"]}
            fill
            className="object-cover"
          />
          
          {/* Image Navigation */}
          {displayImages.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={prevImage}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white"
                onClick={nextImage}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          {displayImages.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {currentImageIndex + 1} / {displayImages.length}
            </div>
          )}

          {/* Room Level Badge */}
          <Badge className="absolute top-2 left-2 bg-primary">
            {roomType["room-level"]}. Kat
          </Badge>

          {/* Price Range Badge */}
          {priceOffers.length > 0 && (
            <Badge className="absolute top-2 right-2 bg-green-600">
              {minPrice === maxPrice 
                ? `${minPrice.toLocaleString('tr-TR')} ${currency}`
                : `${minPrice.toLocaleString('tr-TR')} - ${maxPrice.toLocaleString('tr-TR')} ${currency}`
              }
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Room Name and Code */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {roomType["room-name"]}
          </h3>
          <Badge variant="outline">
            {roomType["room-code"]}
          </Badge>
        </div>

        {/* Room Capacity */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Max {roomType["room-rules"]["max-adult-capacity"]} yetişkin</span>
          </div>
          {roomType["room-rules"]["max-child-capacity"] && (
            <div className="flex items-center gap-1">
              <span>Max {roomType["room-rules"]["max-child-capacity"]} çocuk</span>
            </div>
          )}
          {roomType["room-area"] && (
            <div className="flex items-center gap-1">
              <span>{roomType["room-area"]} m²</span>
            </div>
          )}
        </div>

        {/* Room Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {roomType["room-has-wifi"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              WiFi
            </Badge>
          )}
          {roomType["room-has-safe"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Kasa
            </Badge>
          )}
          {roomType["room-has-private-bath"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Bath className="h-3 w-3" />
              Banyo
            </Badge>
          )}
          {roomType["room-has-balcony"] && (
            <Badge variant="secondary" className="text-xs">
              Balkon
            </Badge>
          )}
        </div>

        {/* Price Offers */}
        {priceOffers.length > 0 ? (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Mevcut Fiyatlar ({nights} gece):</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {priceOffers.map((offer) => (
                <div key={offer.id} className="border rounded-lg p-3 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {getBoardTypeDescription(offer["board-type"])}
                      </Badge>
                      <Badge 
                        variant={offer["cancellation-penalty"]["is-refundable"] ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {offer["rate-type"]}
                      </Badge>
                    </div>
                    <div className="text-right">
                      {offer["discount-percent"] > 0 && (
                        <div className="text-xs text-gray-500 line-through">
                          {offer.price.toLocaleString('tr-TR')} {offer.currency}
                        </div>
                      )}
                      <div className="font-semibold text-green-600">
                        {offer["discounted-price"].toLocaleString('tr-TR')} {offer.currency}
                      </div>
                      <div className="text-xs text-gray-500">
                        Gecelik: {Math.round(offer["discounted-price"] / nights).toLocaleString('tr-TR')} {offer.currency}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      {offer["cancellation-penalty"]["is-refundable"] ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-red-600" />
                      )}
                      <span>
                        {offer["room-tosell"]} oda müsait
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      onClick={() => handleReservation(offer)}
                      className="text-xs"
                    >
                      Rezerve Et
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Bu tarihler için fiyat bulunamadı</p>
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {/* Room Details Dialog */}
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Eye className="h-4 w-4 mr-2" />
              Oda Detayları
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {roomType["room-name"]}
                <Badge variant="outline">{roomType["room-code"]}</Badge>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Room Images Gallery */}
              {displayImages.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-semibold">Oda Görselleri</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {displayImages.map((imageUrl, index) => (
                      <div key={index} className="relative h-32 rounded overflow-hidden">
                        <Image
                          src={imageUrl || '/placeholder.svg?height=128&width=200'}
                          alt={`${roomType["room-name"]} - ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Oda Bilgileri</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Oda Kodu:</span>
                      <span className="font-medium">{roomType["room-code"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kat:</span>
                      <span className="font-medium">{roomType["room-level"]}</span>
                    </div>
                    {roomType["room-area"] && (
                      <div className="flex justify-between">
                        <span>Alan:</span>
                        <span className="font-medium">{roomType["room-area"]} m²</span>
                      </div>
                    )}
                    {roomType["room-bed-options"] && (
                      <div className="flex justify-between">
                        <span>Yatak:</span>
                        <span className="font-medium">{roomType["room-bed-options"]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Kapasite</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Yetişkin:</span>
                      <span className="font-medium">{roomType["room-rules"]["max-adult-capacity"]}</span>
                    </div>
                    {roomType["room-rules"]["max-child-capacity"] && (
                      <div className="flex justify-between">
                        <span>Max Çocuk:</span>
                        <span className="font-medium">{roomType["room-rules"]["max-child-capacity"]}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Toplam Kapasite:</span>
                      <span className="font-medium">{roomType["room-rules"]["max-pax-capacity"]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Price Information */}
              {priceOffers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Detaylı Fiyat Bilgileri</h4>
                  <div className="space-y-3">
                    {priceOffers.map((offer) => (
                      <div key={offer.id} className="border rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h5 className="font-medium mb-2">{getBoardTypeDescription(offer["board-type"])}</h5>
                            <div className="space-y-1 text-sm">
                              <p><strong>Oran Tipi:</strong> {offer["rate-type"]}</p>
                              <p><strong>Müsait Oda:</strong> {offer["room-tosell"]}</p>
                              {offer["min-los"] && (
                                <p><strong>Min Konaklama:</strong> {offer["min-los"]} gece</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Fiyat Detayı</h5>
                            <div className="space-y-1 text-sm">
                              <p><strong>Orijinal Fiyat:</strong> {offer.price.toLocaleString('tr-TR')} {offer.currency}</p>
                              {offer["discount-percent"] > 0 && (
                                <p><strong>İndirim:</strong> %{offer["discount-percent"]} ({offer["discount-amount"]} {offer.currency})</p>
                              )}
                              <p><strong>Son Fiyat:</strong> <span className="text-green-600 font-semibold">{offer["discounted-price"].toLocaleString('tr-TR')} {offer.currency}</span></p>
                              <p><strong>Gecelik:</strong> {Math.round(offer["discounted-price"] / nights).toLocaleString('tr-TR')} {offer.currency}</p>
                            </div>
                          </div>
                        </div>
                        
                        <Separator className="my-3" />
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm">
                            <p><strong>İptal Koşulları:</strong></p>
                            <p className="text-gray-600">
                              {offer["cancellation-penalty"]["is-refundable"] 
                                ? `${offer["cancellation-penalty"]["period-in-days"]} gün öncesine kadar iptal edilebilir`
                                : 'İptal edilemez'
                              }
                            </p>
                          </div>
                          <Button onClick={() => handleReservation(offer)}>
                            <CreditCard className="h-4 w-4 mr-2" />
                            Rezerve Et
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Amenities */}
              {roomType["room-amenity"] && roomType["room-amenity"].length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Oda Olanakları</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {roomType["room-amenity"].map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getAmenityIcon(amenity.name)}
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Description */}
              {roomType["room-property"] && (
                <div>
                  <h4 className="font-semibold mb-3">Oda Açıklaması</h4>
                  <div 
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: roomType["room-property"] }}
                  />
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
