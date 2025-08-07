'use client';

import { useState } from 'react';
import { Filter, Star, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RoomFilterState } from '@/lib/types';

interface RoomFiltersProps {
  onFiltersChange: (filters: RoomFilterState) => void;
  availableBoardTypes: { code: string; name: string }[];
  availableRoomTypes: { id: number; name: string }[];
  priceRange: [number, number];
  className?: string;
}

export default function RoomFilters({ 
  onFiltersChange, 
  availableBoardTypes, 
  availableRoomTypes,
  priceRange,
  className 
}: RoomFiltersProps) {
  const [filters, setFilters] = useState<RoomFilterState>({
    priceRange: priceRange,
    boardTypes: [],
    roomTypes: [],
    cancellationPolicy: 'all',
    sortBy: 'price',
    sortOrder: 'asc',
  });

  const updateFilters = (newFilters: Partial<RoomFilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handlePriceRangeChange = (value: number[]) => {
    updateFilters({ priceRange: [value[0], value[1]] });
  };

  const handleBoardTypeChange = (boardType: string, checked: boolean) => {
    const newBoardTypes = checked 
      ? [...filters.boardTypes, boardType]
      : filters.boardTypes.filter(bt => bt !== boardType);
    updateFilters({ boardTypes: newBoardTypes });
  };

  const handleRoomTypeChange = (roomTypeId: number, checked: boolean) => {
    const newRoomTypes = checked
      ? [...filters.roomTypes, roomTypeId]
      : filters.roomTypes.filter(rt => rt !== roomTypeId);
    updateFilters({ roomTypes: newRoomTypes });
  };

  const handleSortChange = (value: string) => {
    const [sortBy, sortOrder] = value.split('-') as [RoomFilterState['sortBy'], RoomFilterState['sortOrder']];
    updateFilters({ sortBy, sortOrder });
  };

  const clearFilters = () => {
    const defaultFilters: RoomFilterState = {
      priceRange: priceRange,
      boardTypes: [],
      roomTypes: [],
      cancellationPolicy: 'all',
      sortBy: 'price',
      sortOrder: 'asc',
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const activeFilterCount = 
    (filters.boardTypes.length > 0 ? 1 : 0) +
    (filters.roomTypes.length > 0 ? 1 : 0) +
    (filters.cancellationPolicy !== 'all' ? 1 : 0) +
    (filters.priceRange[0] > priceRange[0] || filters.priceRange[1] < priceRange[1] ? 1 : 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Temizle
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sort Options */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Sıralama</Label>
          <Select 
            value={`${filters.sortBy}-${filters.sortOrder}`} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Fiyat (Düşükten Yükseğe)</SelectItem>
              <SelectItem value="price-desc">Fiyat (Yüksekten Düşüğe)</SelectItem>
              <SelectItem value="roomType-asc">Oda Tipi (A-Z)</SelectItem>
              <SelectItem value="boardType-asc">Pansiyon Tipi (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Fiyat Aralığı</Label>
          <div className="px-2">
            <Slider
              value={filters.priceRange}
              onValueChange={handlePriceRangeChange}
              max={priceRange[1]}
              min={priceRange[0]}
              step={50}
              className="w-full"
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{filters.priceRange[0].toLocaleString('tr-TR')} €</span>
            <span>{filters.priceRange[1].toLocaleString('tr-TR')} €</span>
          </div>
        </div>

        {/* Board Types */}
        {availableBoardTypes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Pansiyon Tipi</Label>
            <div className="space-y-2">
              {availableBoardTypes.map((boardType) => (
                <div key={boardType.code} className="flex items-center space-x-2">
                  <Checkbox
                    id={`board-${boardType.code}`}
                    checked={filters.boardTypes.includes(boardType.code)}
                    onCheckedChange={(checked) => 
                      handleBoardTypeChange(boardType.code, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`board-${boardType.code}`}
                    className="text-sm cursor-pointer"
                  >
                    {boardType.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Room Types */}
        {availableRoomTypes.length > 0 && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Oda Tipi</Label>
            <div className="space-y-2">
              {availableRoomTypes.map((roomType) => (
                <div key={roomType.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`room-${roomType.id}`}
                    checked={filters.roomTypes.includes(roomType.id)}
                    onCheckedChange={(checked) => 
                      handleRoomTypeChange(roomType.id, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`room-${roomType.id}`}
                    className="text-sm cursor-pointer"
                  >
                    {roomType.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cancellation Policy */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">İptal Politikası</Label>
          <Select 
            value={filters.cancellationPolicy} 
            onValueChange={(value: RoomFilterState['cancellationPolicy']) => 
              updateFilters({ cancellationPolicy: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="refundable">İptal Edilebilir</SelectItem>
              <SelectItem value="non-refundable">İptal Edilemez</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
