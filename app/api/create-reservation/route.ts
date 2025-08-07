import { NextRequest, NextResponse } from 'next/server';
import { createReservation, getPriceOffers } from '@/lib/api';
import { ReservationRequest, GuestInfo, ReservationFormData, SearchParams } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selectedOffer, searchParams, formData }: {
      selectedOffer: any;
      searchParams: SearchParams;
      formData: ReservationFormData;
    } = body;

    console.log('🎯 Creating reservation with data:', {
      selectedOffer: selectedOffer.id,
      searchParams,
      formData: { ...formData, guests: formData.guests.length }
    });

    // 🔄 Get fresh price data to ensure we have the current price
    console.log('💰 Fetching fresh price data before reservation...');
    try {
      const freshPriceOffers = await getPriceOffers(searchParams, selectedOffer.currency, 'TR');
      
      // Find the matching offer with current price
      const currentOffer = freshPriceOffers.find(offer => 
        offer["room-type-id"] === selectedOffer["room-type-id"] &&
        offer["board-type-id"] === selectedOffer["board-type-id"] &&
        offer["rate-type-id"] === selectedOffer["rate-type-id"] &&
        offer["rate-code-id"] === selectedOffer["rate-code-id"]
      );

      if (!currentOffer) {
        throw new Error('Seçilen oda artık müsait değil. Lütfen yeni bir arama yapın.');
      }

      // Check if price has changed significantly (more than 1% difference)
      const priceDifference = Math.abs(currentOffer["discounted-price"] - selectedOffer["discounted-price"]);
      const priceChangePercent = (priceDifference / selectedOffer["discounted-price"]) * 100;

      if (priceChangePercent > 1) {
        console.warn('⚠️ Price changed:', {
          oldPrice: selectedOffer["discounted-price"],
          newPrice: currentOffer["discounted-price"],
          difference: priceDifference,
          changePercent: priceChangePercent.toFixed(2) + '%'
        });

        return NextResponse.json({
          success: false,
          error: 'Fiyat değişikliği tespit edildi',
          priceChanged: true,
          oldPrice: selectedOffer["discounted-price"],
          newPrice: currentOffer["discounted-price"],
          message: `Fiyat ${selectedOffer["discounted-price"]} ${selectedOffer.currency} yerine ${currentOffer["discounted-price"]} ${currentOffer.currency} olarak güncellendi. Lütfen yeni fiyatı onaylayın.`
        }, { status: 409 });
      }

      // Use the current offer data for reservation
      selectedOffer["discounted-price"] = currentOffer["discounted-price"];
      selectedOffer.price = currentOffer.price;
      selectedOffer["discount-amount"] = currentOffer["discount-amount"];
      selectedOffer["promotion-amount"] = currentOffer["promotion-amount"];
      selectedOffer["room-tosell"] = currentOffer["room-tosell"];

      console.log('✅ Price verified, using current price:', currentOffer["discounted-price"], currentOffer.currency);

    } catch (priceError) {
      console.error('❌ Failed to fetch fresh prices:', priceError);
      return NextResponse.json({
        success: false,
        error: 'Güncel fiyat bilgisi alınamadı. Lütfen tekrar deneyin.',
        details: priceError instanceof Error ? priceError.message : 'Bilinmeyen hata'
      }, { status: 500 });
    }

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
        email: guest.email,
        phone: guest.phone
      };
    });

    // Count children by age groups
    const children = searchParams.children || [];
    const elderChildCount = children.filter((child: any) => child.age >= 12 && child.age <= 17).length;
    const youngerChildCount = children.filter((child: any) => child.age >= 2 && child.age <= 11).length;
    const babyCount = children.filter((child: any) => child.age < 2).length;

    // Build reservation request with current price
    const reservationRequest: ReservationRequest = {
      "hotel-id": selectedOffer["hotel-id"],
      "rate-type-id": selectedOffer["rate-type-id"],
      "board-type-id": selectedOffer["board-type-id"],
      "rate-code-id": selectedOffer["rate-code-id"],
      "room-type-id": selectedOffer["room-type-id"],
      "currency-code": selectedOffer.currency,
      "total-price": selectedOffer["discounted-price"], // Use current price
      "price-agency-id": selectedOffer["price-agency-id"],
      "adult-count": searchParams.adults,
      nationality: formData.nationality,
      "check-in": searchParams.fromDate,
      "check-out": searchParams.toDate,
      "elder-child-count": elderChildCount,
      "younger-child-count": youngerChildCount,
      "baby-count": babyCount,
      "guest-list": guestList,
      "res-notes": formData.notes || '',
      "room-count": 1,
      "contact-first-name": formData.contactFirstName,
      "contact-last-name": formData.contactLastName,
      "contact-email": formData.contactEmail,
      "contact-phone": formData.contactPhone,
      "payment-type": 2, // NOT PAID
      "tax-type": formData.taxType === 'company' ? 1 : 2,
      "tax-company": formData.taxCompany,
      "tax-no": formData.taxNo,
      "tax-address": formData.taxAddress
    };

    console.log('📝 Final reservation request:', JSON.stringify(reservationRequest, null, 2));

    // Create reservation via API
    const result = await createReservation(reservationRequest);

    console.log('✅ Reservation created successfully:', result);

    return NextResponse.json({
      success: true,
      reservationId: result["reservation-id"],
      finalPrice: selectedOffer["discounted-price"],
      currency: selectedOffer.currency,
      message: 'Rezervasyon başarıyla oluşturuldu'
    });

  } catch (error: any) {
    console.error('❌ Reservation creation failed:', error);
    
    // Handle specific API errors
    if (error.message && error.message.includes('price quote')) {
      return NextResponse.json({
        success: false,
        error: 'Fiyat bilgisi güncel değil',
        priceError: true,
        message: 'Fiyatlar değişmiş olabilir. Lütfen sayfayı yenileyin ve tekrar deneyin.',
        details: error.message
      }, { status: 409 });
    }
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Rezervasyon oluşturulamadı',
      details: error.toString()
    }, { status: 500 });
  }
}
