import { NextRequest, NextResponse } from 'next/server';
import { updateReservation } from '@/lib/api';
import { UpdateReservationRequest, GuestInfo, UpdateReservationFormData } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedOffer, searchParams, formData, reservationId }: {
      selectedOffer: any;
      searchParams: any;
      formData: UpdateReservationFormData;
      reservationId: number;
    } = body;

    console.log('🔄 Updating reservation with data:', {
      reservationId,
      selectedOffer: selectedOffer.id,
      searchParams,
      formData: { ...formData, guests: formData.guests.length }
    });

    // Transform form data to API format
    const guestList: GuestInfo[] = formData.guests.map((guest) => {
      const titleMap = {
        'mr': 0,
        'ms': 1,
        'child': 2,
        'baby': 3
      };

      return {
        "title-id": titleMap[guest.title],
        gender: guest.gender === 'male' ? 0 : 1,
        country: formData.nationality,
        name: guest.firstName,
        surname: guest.lastName,
        birthday: guest.birthday || undefined,
        "nationality-no": guest.nationalityNo,
        "passport-no": guest.passportNo,
        email: guest.email,
        phone: guest.phone
      };
    });

    // Count children by age groups
    const children = searchParams.children || [];
    const elderChildCount = children.filter((child: any) => child.age >= 12 && child.age <= 17).length;
    const youngerChildCount = children.filter((child: any) => child.age >= 2 && child.age <= 11).length;
    const babyCount = children.filter((child: any) => child.age < 2).length;

    // Build update reservation request
    const updateReservationRequest: UpdateReservationRequest = {
      "hotel-id": selectedOffer["hotel-id"],
      "reservation-id": reservationId,
      "rate-type-id": selectedOffer["rate-type-id"],
      "board-type-id": selectedOffer["board-type-id"],
      "rate-code-id": selectedOffer["rate-code-id"],
      "room-type-id": selectedOffer["room-type-id"],
      "room-id": selectedOffer["room-id"] || undefined,
      "currency-code": selectedOffer.currency,
      "total-price": selectedOffer["discounted-price"],
      "price-agency-id": selectedOffer["price-agency-id"],
      "adult-count": searchParams.adults,
      nationality: formData.nationality,
      "check-in": searchParams.fromDate,
      "check-out": searchParams.toDate,
      "market-id": selectedOffer["market-id"] || undefined,
      "elder-child-count": elderChildCount,
      "younger-child-count": youngerChildCount,
      "baby-count": babyCount,
      "guest-list": guestList,
      "room-count": 1,
      "agency-commission": selectedOffer["commission-percent"] || undefined,
      "voucher-no": formData.voucherNo || '',
      "seller-commission": formData.sellerCommission || undefined,
      "promo-code": formData.promoCode || undefined,
      "use-guest-bonus": formData.useGuestBonus || false,
      "is-offer": formData.isOffer || false
    };

    // Update reservation via API
    const result = await updateReservation(updateReservationRequest);

    console.log('✅ Reservation updated successfully:', result);

    return NextResponse.json({
      success: true,
      reservationId: result["reservation-id"],
      message: result.message || 'Rezervasyon başarıyla güncellendi'
    });

  } catch (error: any) {
    console.error('❌ Reservation update failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Rezervasyon güncellenemedi',
      details: error.toString()
    }, { status: 500 });
  }
}
