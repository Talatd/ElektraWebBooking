'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Users, Bed, Wifi, Car, Utensils, Waves, Info, Check, Calendar } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoomOffer, SearchParams } from '@/lib/types';

interface RoomOfferCardProps {
  offer: RoomOffer;
  searchParams: SearchParams;
  className?: string;
}

const getFacilityIcon = (facilityId: number) => {
  const icons = [
    <Wifi className="h-4 w-4" />,
    <Car className="h-4 w-4" />,
    <Utensils className="h-4 w-4" />,
    <Waves className="h-4 w-4" />
  ];
  return icons[facilityId % icons.length];
};

export default function RoomOfferCard({ offer, searchParams, className }: RoomOfferCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleReservation = async () => {
    setIsLoading(true);
    // TODO: Implement reservation logic
    setTimeout(() => {
      setIsLoading(false);
      alert('Rezervasyon işlemi başlatıldı!');
    }, 1000);
  };

  const nights = Math.ceil(
    (new Date(searchParams.toDate).getTime() - new Date(searchParams.fromDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">{offer.roomName}</h3>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>Max 4 kişi</span>
              </div>
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>Çift kişilik yatak</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{nights} gece</span>
              </div>
            </div>
            
            {/* Board Type Badge */}
            <Badge variant="outline" className="mb-2">
              {offer.boardType.name}
            </Badge>
          </div>
          
          {/* Room Image */}
          {offer.images && offer.images.length > 0 && (
            <div className="relative w-24 h-16 rounded overflow-hidden ml-4">
              <Image
                src={offer.images[0].url || '/placeholder.svg?height=64&width=96'}
                alt={offer.roomName}
                fill
                className="object-cover"
              />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Board Type Description */}
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-sm text-blue-800">{offer.boardType.description}</p>
        </div>

        {/* Room Facilities */}
        {offer.facilities && offer.facilities.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {offer.facilities.slice(0, 4).map((facilityId, index) => (
              <div key={facilityId} className="flex items-center gap-1 text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                {getFacilityIcon(facilityId)}
                <span>Olanak {index + 1}</span>
              </div>
            ))}
            {offer.facilities.length > 4 && (
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                +{offer.facilities.length - 4} daha
              </span>
            )}
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="flex items-start gap-2 p-3 bg-gray-50 rounded">
          <Info className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {offer.cancellationPolicy.isRefundable ? '✅ İptal Edilebilir' : '❌ İptal Edilemez'}
            </p>
            <p className="text-gray-600">{offer.cancellationPolicy.description}</p>
          </div>
        </div>

        {/* Availability Warning */}
        {offer.availability && offer.availability < 5 && (
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded">
            <Info className="h-4 w-4" />
            <span className="text-sm font-medium">
              Sadece {offer.availability} oda kaldı!
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex items-center justify-between pt-4 border-t">
        <div className="text-right">
          <div className="text-sm text-gray-600">
            {nights} gece toplam
          </div>
          <div className="text-2xl font-bold text-primary">
            {offer.price.total.toLocaleString('tr-TR')} {offer.price.currency}
          </div>
          <div className="text-sm text-gray-600">
            Gecelik {offer.price.perNight.toLocaleString('tr-TR')} {offer.price.currency}
          </div>
        </div>

        <div className="flex gap-2">
          {/* Room Details Dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                Detaylar
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{offer.roomName}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {/* Room Images */}
                {offer.images && offer.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {offer.images.slice(0, 4).map((image) => (
                      <div key={image.id} className="relative h-32 rounded overflow-hidden">
                        <Image
                          src={image.url || '/placeholder.svg?height=128&width=200'}
                          alt={image.title || offer.roomName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Detailed Information */}
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-2">Oda Özellikleri</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Maksimum 4 kişi</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>25 m² alan</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span>Balkon</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Dahil Olanlar</h4>
                    <p className="text-sm text-gray-600">{offer.boardType.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">İptal Koşulları</h4>
                    <p className="text-sm text-gray-600">{offer.cancellationPolicy.description}</p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Fiyat Detayı</h4>
                    <div className="text-sm text-gray-600">
                      <p>Gecelik: {offer.price.perNight.toLocaleString('tr-TR')} {offer.price.currency}</p>
                      <p>Toplam ({nights} gece): {offer.price.total.toLocaleString('tr-TR')} {offer.price.currency}</p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Reserve Button */}
          <Button 
            onClick={handleReservation}
            disabled={isLoading}
            className="min-w-[120px]"
          >
            {isLoading ? 'Rezerve Ediliyor...' : 'Rezerve Et'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
