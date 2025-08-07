'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, CreditCard, FileText, Building, Users, Baby, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PriceOffer, ReservationFormData, GuestFormData, SearchParams } from '@/lib/types';

interface ReservationFormProps {
  selectedOffer: PriceOffer;
  searchParams: SearchParams;
  onSubmit: (formData: ReservationFormData) => Promise<void>;
  isLoading?: boolean;
}

const titleOptions = [
  { value: 'mr', label: 'Bay', apiValue: 0 },
  { value: 'ms', label: 'Bayan', apiValue: 1 },
  { value: 'child', label: 'Çocuk', apiValue: 2 },
  { value: 'baby', label: 'Bebek', apiValue: 3 }
];

const countryOptions = [
  { value: 'TR', label: 'Türkiye' },
  { value: 'US', label: 'Amerika Birleşik Devletleri' },
  { value: 'DE', label: 'Almanya' },
  { value: 'FR', label: 'Fransa' },
  { value: 'GB', label: 'İngiltere' },
  { value: 'IT', label: 'İtalya' },
  { value: 'ES', label: 'İspanya' },
  { value: 'NL', label: 'Hollanda' },
  { value: 'RU', label: 'Rusya' }
];

export default function ReservationForm({ selectedOffer, searchParams, onSubmit, isLoading = false }: ReservationFormProps) {
  const router = useRouter();
  
  // Calculate guest counts
  const adultCount = searchParams.adults;
  const childCount = searchParams.children.length;
  const totalGuests = adultCount + childCount;

  // Form state
  const [formData, setFormData] = useState<ReservationFormData>({
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    nationality: 'TR',
    guests: Array.from({ length: totalGuests }, (_, index) => ({
      title: index < adultCount ? 'mr' : 'child',
      firstName: '',
      lastName: '',
      birthday: index >= adultCount ? '' : undefined,
      gender: 'male'
    })),
    notes: '',
    taxType: 'personal'
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Validation
  const validateForm = useCallback((): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Contact information validation
    if (!formData.contactFirstName.trim()) {
      newErrors.contactFirstName = 'İletişim adı gerekli';
    }
    if (!formData.contactLastName.trim()) {
      newErrors.contactLastName = 'İletişim soyadı gerekli';
    }
    if (!formData.contactEmail.trim()) {
      newErrors.contactEmail = 'E-posta adresi gerekli';
    } else if (!/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Geçerli bir e-posta adresi girin';
    }
    if (!formData.contactPhone.trim()) {
      newErrors.contactPhone = 'Telefon numarası gerekli';
    }

    // Guest validation
    formData.guests.forEach((guest, index) => {
      if (!guest.firstName.trim()) {
        newErrors[`guest_${index}_firstName`] = `${index + 1}. misafir adı gerekli`;
      }
      if (!guest.lastName.trim()) {
        newErrors[`guest_${index}_lastName`] = `${index + 1}. misafir soyadı gerekli`;
      }
      if ((guest.title === 'child' || guest.title === 'baby') && !guest.birthday) {
        newErrors[`guest_${index}_birthday`] = `${index + 1}. misafir doğum tarihi gerekli`;
      }
    });

    // Tax information validation for company
    if (formData.taxType === 'company') {
      if (!formData.taxCompany?.trim()) {
        newErrors.taxCompany = 'Şirket adı gerekli';
      }
      if (!formData.taxNo?.trim()) {
        newErrors.taxNo = 'Vergi numarası gerekli';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Update guest data
  const updateGuest = useCallback((index: number, field: keyof GuestFormData, value: string) => {
    setFormData(prevData => {
      const newGuests = [...prevData.guests];
      newGuests[index] = { ...newGuests[index], [field]: value };
      return { ...prevData, guests: newGuests };
    });
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Reservation submission error:', error);
    }
  }, [formData, validateForm, onSubmit]);

  // Calculate nights and total price
  const nights = Math.ceil(
    (new Date(searchParams.toDate).getTime() - new Date(searchParams.fromDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Reservation Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Rezervasyon Özeti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><strong>Oda Tipi:</strong> {selectedOffer["room-type"]}</p>
              <p><strong>Pansiyon:</strong> {selectedOffer["board-type"]}</p>
              <p><strong>Tarihler:</strong> {searchParams.fromDate} - {searchParams.toDate}</p>
              <p><strong>Gece Sayısı:</strong> {nights}</p>
            </div>
            <div>
              <p><strong>Misafir Sayısı:</strong> {adultCount} Yetişkin{childCount > 0 && `, ${childCount} Çocuk`}</p>
              <p><strong>İptal Koşulu:</strong> {selectedOffer["rate-type"]}</p>
              <div className="mt-2">
                <Badge variant="outline" className="text-lg">
                  <strong>Toplam: {selectedOffer["discounted-price"].toLocaleString('tr-TR')} {selectedOffer.currency}</strong>
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Price Notice */}
          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Fiyat Uyarısı:</strong> Gösterilen fiyat rezervasyon sırasında güncel fiyat ile kontrol edilecektir. 
              Fiyat değişikliği durumunda bilgilendirileceksiniz.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              İletişim Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactFirstName">Ad *</Label>
                <Input
                  id="contactFirstName"
                  value={formData.contactFirstName}
                  onChange={(e) => setFormData({ ...formData, contactFirstName: e.target.value })}
                  className={errors.contactFirstName ? 'border-red-500' : ''}
                />
                {errors.contactFirstName && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactFirstName}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactLastName">Soyad *</Label>
                <Input
                  id="contactLastName"
                  value={formData.contactLastName}
                  onChange={(e) => setFormData({ ...formData, contactLastName: e.target.value })}
                  className={errors.contactLastName ? 'border-red-500' : ''}
                />
                {errors.contactLastName && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactLastName}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">E-posta *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  className={errors.contactEmail ? 'border-red-500' : ''}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactEmail}</p>
                )}
              </div>
              <div>
                <Label htmlFor="contactPhone">Telefon *</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  className={errors.contactPhone ? 'border-red-500' : ''}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500 mt-1">{errors.contactPhone}</p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="nationality">Ülke</Label>
              <Select value={formData.nationality} onValueChange={(value) => setFormData({ ...formData, nationality: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {countryOptions.map((country) => (
                    <SelectItem key={country.value} value={country.value}>
                      {country.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Guest Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Misafir Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {formData.guests.map((guest, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-medium mb-4 flex items-center gap-2">
                  {index < adultCount ? <User className="h-4 w-4" /> : <Baby className="h-4 w-4" />}
                  {index + 1}. Misafir {index < adultCount ? '(Yetişkin)' : '(Çocuk)'}
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Unvan *</Label>
                    <Select 
                      value={guest.title} 
                      onValueChange={(value: any) => updateGuest(index, 'title', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {titleOptions
                          .filter(option => index < adultCount ? ['mr', 'ms'].includes(option.value) : ['child', 'baby'].includes(option.value))
                          .map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Ad *</Label>
                    <Input
                      value={guest.firstName}
                      onChange={(e) => updateGuest(index, 'firstName', e.target.value)}
                      className={errors[`guest_${index}_firstName`] ? 'border-red-500' : ''}
                    />
                    {errors[`guest_${index}_firstName`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`guest_${index}_firstName`]}</p>
                    )}
                  </div>
                  
                  <div>
                    <Label>Soyad *</Label>
                    <Input
                      value={guest.lastName}
                      onChange={(e) => updateGuest(index, 'lastName', e.target.value)}
                      className={errors[`guest_${index}_lastName`] ? 'border-red-500' : ''}
                    />
                    {errors[`guest_${index}_lastName`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`guest_${index}_lastName`]}</p>
                    )}
                  </div>
                </div>

                {(guest.title === 'child' || guest.title === 'baby') && (
                  <div className="mt-4">
                    <Label>Doğum Tarihi *</Label>
                    <Input
                      type="date"
                      value={guest.birthday || ''}
                      onChange={(e) => updateGuest(index, 'birthday', e.target.value)}
                      className={errors[`guest_${index}_birthday`] ? 'border-red-500' : ''}
                    />
                    {errors[`guest_${index}_birthday`] && (
                      <p className="text-sm text-red-500 mt-1">{errors[`guest_${index}_birthday`]}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Tax Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Fatura Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Fatura Tipi</Label>
              <Select 
                value={formData.taxType} 
                onValueChange={(value: 'personal' | 'company') => setFormData({ ...formData, taxType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">Bireysel</SelectItem>
                  <SelectItem value="company">Kurumsal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.taxType === 'company' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="taxCompany">Şirket Adı *</Label>
                  <Input
                    id="taxCompany"
                    value={formData.taxCompany || ''}
                    onChange={(e) => setFormData({ ...formData, taxCompany: e.target.value })}
                    className={errors.taxCompany ? 'border-red-500' : ''}
                  />
                  {errors.taxCompany && (
                    <p className="text-sm text-red-500 mt-1">{errors.taxCompany}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="taxNo">Vergi Numarası *</Label>
                  <Input
                    id="taxNo"
                    value={formData.taxNo || ''}
                    onChange={(e) => setFormData({ ...formData, taxNo: e.target.value })}
                    className={errors.taxNo ? 'border-red-500' : ''}
                  />
                  {errors.taxNo && (
                    <p className="text-sm text-red-500 mt-1">{errors.taxNo}</p>
                  )}
                </div>
                
                <div>
                  <Label htmlFor="taxAddress">Vergi Adresi</Label>
                  <Textarea
                    id="taxAddress"
                    value={formData.taxAddress || ''}
                    onChange={(e) => setFormData({ ...formData, taxAddress: e.target.value })}
                    rows={3}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Ek Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Özel isteklerinizi buraya yazabilirsiniz..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="flex-1"
          >
            Geri Dön
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? 'Rezervasyon Yapılıyor...' : 'Rezervasyonu Tamamla'}
          </Button>
        </div>
      </form>
    </div>
  );
}
