'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Users, Bed, Wifi, Shield, Bath, Wind, MapPin, Eye, ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RoomType } from '@/lib/types';

interface RoomTypeCardProps {
  room: RoomType;
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

export default function RoomTypeCard({ room, className }: RoomTypeCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    if (room["room-images"].length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % room["room-images"].length);
    }
  };

  const prevImage = () => {
    if (room["room-images"].length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + room["room-images"].length) % room["room-images"].length);
    }
  };

  const displayImages = room["room-images"].length > 0 ? room["room-images"] : [room["room-image-url"]];

  return (
    <Card className={`hover:shadow-lg transition-shadow ${className}`}>
      <CardHeader className="p-0">
        <div className="relative h-48 overflow-hidden rounded-t-lg">
          <Image
            src={displayImages[currentImageIndex] || '/placeholder.svg?height=200&width=300&text=Room'}
            alt={room["room-name"]}
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
            {room["room-level"]}. Kat
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        {/* Room Name and Code */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {room["room-name"]}
          </h3>
          <Badge variant="outline">
            {room["room-code"]}
          </Badge>
        </div>

        {/* Room Capacity */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>Max {room["room-rules"]["max-adult-capacity"]} yetişkin</span>
          </div>
          {room["room-rules"]["max-child-capacity"] && (
            <div className="flex items-center gap-1">
              <span>Max {room["room-rules"]["max-child-capacity"]} çocuk</span>
            </div>
          )}
          {room["room-area"] && (
            <div className="flex items-center gap-1">
              <span>{room["room-area"]} m²</span>
            </div>
          )}
        </div>

        {/* Bed Options */}
        {room["room-bed-options"] && (
          <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
            <Bed className="h-4 w-4" />
            <span>{room["room-bed-options"]}</span>
          </div>
        )}

        {/* Room Features */}
        <div className="flex flex-wrap gap-2 mb-3">
          {room["room-has-wifi"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Wifi className="h-3 w-3" />
              WiFi
            </Badge>
          )}
          {room["room-has-safe"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Kasa
            </Badge>
          )}
          {room["room-has-private-bath"] && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Bath className="h-3 w-3" />
              Banyo
            </Badge>
          )}
          {room["room-has-balcony"] && (
            <Badge variant="secondary" className="text-xs">
              Balkon
            </Badge>
          )}
        </div>

        {/* Room Amenities */}
        {room["room-amenity"] && room["room-amenity"].length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {room["room-amenity"].slice(0, 3).map((amenity, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="text-xs flex items-center gap-1"
              >
                {getAmenityIcon(amenity.name)}
                <span>{amenity.name}</span>
              </Badge>
            ))}
            {room["room-amenity"].length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{room["room-amenity"].length - 3} daha
              </Badge>
            )}
          </div>
        )}

        {/* Room Description Preview */}
        {room["room-property"] && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {room["room-property"].replace(/<[^>]*>/g, '').substring(0, 100)}...
          </p>
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
                {room["room-name"]}
                <Badge variant="outline">{room["room-code"]}</Badge>
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
                          alt={`${room["room-name"]} - ${index + 1}`}
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
                      <span className="font-medium">{room["room-code"]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kat:</span>
                      <span className="font-medium">{room["room-level"]}</span>
                    </div>
                    {room["room-area"] && (
                      <div className="flex justify-between">
                        <span>Alan:</span>
                        <span className="font-medium">{room["room-area"]} m²</span>
                      </div>
                    )}
                    {room["room-bed-options"] && (
                      <div className="flex justify-between">
                        <span>Yatak:</span>
                        <span className="font-medium">{room["room-bed-options"]}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Kapasite</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Max Yetişkin:</span>
                      <span className="font-medium">{room["room-rules"]["max-adult-capacity"]}</span>
                    </div>
                    {room["room-rules"]["max-child-capacity"] && (
                      <div className="flex justify-between">
                        <span>Max Çocuk:</span>
                        <span className="font-medium">{room["room-rules"]["max-child-capacity"]}</span>
                      </div>
                    )}
                    {room["room-rules"]["max-baby-capacity"] && (
                      <div className="flex justify-between">
                        <span>Max Bebek:</span>
                        <span className="font-medium">{room["room-rules"]["max-baby-capacity"]}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Toplam Kapasite:</span>
                      <span className="font-medium">{room["room-rules"]["max-pax-capacity"]}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Room Amenities */}
              {room["room-amenity"] && room["room-amenity"].length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Oda Olanakları</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {room["room-amenity"].map((amenity, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                        {getAmenityIcon(amenity.name)}
                        <span className="text-sm">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Room Description */}
              {room["room-property"] && (
                <div>
                  <h4 className="font-semibold mb-3">Oda Açıklaması</h4>
                  <div 
                    className="text-sm text-gray-700 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: room["room-property"] }}
                  />
                </div>
              )}

              {/* Location */}
              {room["room-latitude"] && room["room-longitude"] && (
                <div>
                  <h4 className="font-semibold mb-3">Konum</h4>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {room["room-latitude"]}, {room["room-longitude"]}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}
