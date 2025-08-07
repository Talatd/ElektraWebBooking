'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { CalendarIcon, Users, Baby, Search } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface BookingSearchFormProps {
  className?: string;
}

export default function BookingSearchForm({ className }: BookingSearchFormProps) {
  const router = useRouter();
  
  // Form state
  const [checkIn, setCheckIn] = useState<Date>();
  const [checkOut, setCheckOut] = useState<Date>();
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [childAges, setChildAges] = useState<number[]>([]);
  const [currency, setCurrency] = useState<string>('TRY');
  const [isLoading, setIsLoading] = useState(false);

  // Handle child count change
  const handleChildrenChange = (count: number) => {
    setChildren(count);
    if (count > childAges.length) {
      const newAges = [...childAges];
      for (let i = childAges.length; i < count; i++) {
        newAges.push(5);
      }
      setChildAges(newAges);
    } else {
      setChildAges(childAges.slice(0, count));
    }
  };

  // Handle child age change
  const handleChildAgeChange = (index: number, age: number) => {
    const newAges = [...childAges];
    newAges[index] = age;
    setChildAges(newAges);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!checkIn || !checkOut) {
      alert('Lütfen giriş ve çıkış tarihlerini seçin');
      return;
    }

    if (checkIn >= checkOut) {
      alert('Çıkış tarihi giriş tarihinden sonra olmalıdır');
      return;
    }

    // Check if dates are not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (checkIn < today) {
      alert('Giriş tarihi bugünden önce olamaz');
      return;
    }

    setIsLoading(true);

    try {
      const searchParams = new URLSearchParams({
        fromdate: format(checkIn, 'yyyy-MM-dd'),
        todate: format(checkOut, 'yyyy-MM-dd'),
        adult: adults.toString(),
        currency: currency,
      });

      // Add child ages with validation
      childAges.forEach((age, index) => {
        if (age >= 1 && age <= 17) {
          searchParams.append(`child${index + 1}`, age.toString());
        }
      });

      console.log('Navigating to:', `/rezervasyon?${searchParams.toString()}`);
      router.push(`/rezervasyon?${searchParams.toString()}`);
    } catch (error) {
      console.error('Search error:', error);
      alert('Arama sırasında bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={cn('w-full max-w-4xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          Oda Rezervasyonu
        </CardTitle>
        <p className="text-center text-muted-foreground">
          Tarihlerinizi seçin ve uygun odaları görün
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Date Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="checkin">Giriş Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !checkIn && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkIn ? format(checkIn, 'dd/MM/yyyy') : 'Tarih seçin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout">Çıkış Tarihi</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !checkOut && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {checkOut ? format(checkOut, 'dd/MM/yyyy') : 'Tarih seçin'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    disabled={(date) => date < (checkIn || new Date())}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Guest Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="adults">
                <Users className="inline mr-2 h-4 w-4" />
                Yetişkin Sayısı
              </Label>
              <Select value={adults.toString()} onValueChange={(value) => setAdults(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Yetişkin
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="children">
                <Baby className="inline mr-2 h-4 w-4" />
                Çocuk Sayısı
              </Label>
              <Select value={children.toString()} onValueChange={(value) => handleChildrenChange(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} Çocuk
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Para Birimi</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TRY">TRY (₺)</SelectItem>
                  <SelectItem value="EUR">EUR (€)</SelectItem>
                  <SelectItem value="USD">USD ($)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Child Ages */}
          {children > 0 && (
            <div className="space-y-2">
              <Label>Çocuk Yaşları</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {Array.from({ length: children }, (_, index) => (
                  <div key={index} className="space-y-1">
                    <Label className="text-sm">{index + 1}. Çocuk</Label>
                    <Select
                      value={childAges[index]?.toString() || '5'}
                      onValueChange={(value) => handleChildAgeChange(index, parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 17 }, (_, i) => i + 1).map((age) => (
                          <SelectItem key={age} value={age.toString()}>
                            {age} yaş
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full text-lg py-6"
            disabled={isLoading}
          >
            <Search className="mr-2 h-5 w-5" />
            {isLoading ? 'Aranıyor...' : 'Uygun Odaları Göster'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
