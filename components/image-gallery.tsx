'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { HotelImage } from '@/lib/types';

interface ImageGalleryProps {
  images: HotelImage[];
  className?: string;
}

export default function ImageGallery({ images, className }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Görsel bulunamadı</p>
      </div>
    );
  }

  const nextImage = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const openModal = (index: number) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
  };

  return (
    <>
      {/* Main Gallery */}
      <div className={`relative ${className}`}>
        {/* Main Image - Larger for better display */}
        <div className="relative h-80 md:h-[500px] rounded-lg overflow-hidden cursor-pointer">
          <Image
            src={images[currentIndex]?.url || '/placeholder.svg?height=500&width=800'}
            alt={images[currentIndex]?.title || 'Hotel image'}
            fill
            className="object-cover"
            onClick={() => openModal(currentIndex)}
            priority={currentIndex === 0}
          />
          
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={prevImage}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                onClick={nextImage}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Image Counter */}
          <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>

          {/* Image Title Overlay */}
          {images[currentIndex]?.title && (
            <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-2 rounded-lg max-w-md">
              <p className="text-sm font-medium">{images[currentIndex].title}</p>
            </div>
          )}
        </div>

        {/* Thumbnail Strip - Show more thumbnails for many images */}
        {images.length > 1 && (
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`relative flex-shrink-0 w-20 h-16 rounded cursor-pointer overflow-hidden border-2 transition-all ${
                  index === currentIndex 
                    ? 'border-primary ring-2 ring-primary/20' 
                    : 'border-transparent hover:border-gray-300'
                }`}
                onClick={() => setCurrentIndex(index)}
              >
                <Image
                  src={image.url || '/placeholder.svg?height=64&width=80'}
                  alt={image.title || `Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
                {/* Thumbnail overlay for current image */}
                {index === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick Navigation Dots for many images */}
        {images.length > 10 && (
          <div className="flex justify-center mt-4 gap-1">
            {Array.from({ length: Math.min(10, Math.ceil(images.length / 5)) }, (_, i) => (
              <button
                key={i}
                className={`w-2 h-2 rounded-full transition-all ${
                  Math.floor(currentIndex / 5) === i 
                    ? 'bg-primary' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                onClick={() => setCurrentIndex(i * 5)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal - Enhanced for many images */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-6xl w-full p-0 max-h-[95vh] overflow-hidden">
          <div className="relative">
            <div className="relative h-[80vh]">
              <Image
                src={images[currentIndex]?.url || '/placeholder.svg?height=600&width=1000'}
                alt={images[currentIndex]?.title || 'Hotel image'}
                fill
                className="object-contain"
              />
              
              {/* Modal Navigation */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white shadow-lg"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}

              {/* Modal Counter */}
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-2 rounded-lg text-sm font-medium">
                {currentIndex + 1} / {images.length}
              </div>
            </div>

            {/* Modal Image Info */}
            {images[currentIndex]?.title && (
              <div className="p-4 bg-white border-t">
                <h3 className="font-semibold">{images[currentIndex].title}</h3>
                {images[currentIndex]?.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {images[currentIndex].description}
                  </p>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
