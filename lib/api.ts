import { HotelParams, RoomDefinitionsResponse, PriceOffersResponse, PriceOffer, SearchParams, RoomTypeWithPrices, ReservationRequest, ReservationResponse, UpdateReservationRequest, UpdateReservationResponse } from './types';

const API_BASE_URL = 'https://bookingapi.elektraweb.com';
const HOTEL_ID = '23155';

// Get the API token from environment variables
const getAuthHeaders = () => {
  const token = process.env.ELEKTRA_API_TOKEN;
  if (!token) {
    throw new Error('ELEKTRA_API_TOKEN environment variable is not set');
  }
  
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'x-captcha': '', // Required header for update operations
  };
};

/**
 * Transform API images to component-compatible format
 */
function transformApiImages(apiImages: any[]): HotelImage[] {
  if (!apiImages || !Array.isArray(apiImages)) {
    return [];
  }

  return apiImages.map((img, index) => ({
    id: img.id || index,
    url: img.url || img["image-url"] || '',
    title: img.title || img.description || `Hotel Image ${index + 1}`,
    description: img.description || '',
    isMain: img["is-main"] || img.order === 1 || index === 0
  }));
}

/**
 * Fetch hotel parameters including general information, promotional photos, and contact details
 * SERVER-SIDE API CALL - Cached for 1 hour
 */
export async function getHotelParams(language: string = 'TR'): Promise<HotelParams> {
  try {
    console.log('🌐 API CALL: getHotelParams - Server-side');
    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/params?language=${language}`,
      {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hotel parameters: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform images to compatible format
    if (data.images) {
      data.images = transformApiImages(data.images);
      console.log(`✅ Hotel params loaded with ${data.images.length} images`);
    }
    
    console.log('✅ Hotel params loaded from API');
    return data;
  } catch (error) {
    console.error('❌ Error fetching hotel parameters:', error);
    throw new Error('Failed to load hotel information');
  }
}

/**
 * Fetch hotel room definitions - REAL API STRUCTURE
 * SERVER-SIDE API CALL - Cached for 24 hours
 */
export async function getHotelDefinitions(language: string = 'TR'): Promise<RoomDefinitionsResponse> {
  try {
    console.log('🌐 API CALL: getHotelDefinitions - Server-side');
    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/hotel-definitions?language=${language}&room-details=true`,
      {
        headers: getAuthHeaders(),
        next: { revalidate: 86400 } // Cache for 24 hours
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hotel definitions: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Hotel definitions loaded from API');
    console.log('📊 Room types found:', data.roomtype?.length || 0);
    console.log('📊 Board types found:', data.boardtypes?.length || 0);
    console.log('📊 Rate types found:', data.ratetypes?.length || 0);
    return data;
  } catch (error) {
    console.error('❌ Error fetching hotel definitions:', error);
    throw new Error('Failed to load hotel definitions');
  }
}

/**
 * Query real-time room prices and availability - UPDATED FOR REAL API
 * SERVER-SIDE API CALL - NO CACHE (Real-time data)
 */
export async function getPriceOffers(
  searchParams: SearchParams,
  currency: string = 'EUR',
  language: string = 'TR'
): Promise<PriceOffer[]> {
  try {
    console.log('🌐 API CALL: getPriceOffers - Server-side (Real-time)');
    
    // Validate required parameters
    if (!searchParams.fromDate || !searchParams.toDate) {
      throw new Error('From date and to date are required');
    }

    if (!searchParams.adults || searchParams.adults < 1) {
      throw new Error('At least 1 adult is required');
    }

    // Validate and normalize currency - API requires 3+ character codes
    const validCurrencies = ['EUR', 'USD', 'TRY']; // Removed 'TL' as it's only 2 chars
    let normalizedCurrency = currency && currency.length >= 2 ? currency.toUpperCase() : 'TRY';

    // Convert short codes to full codes
    if (normalizedCurrency === 'TL') {
      normalizedCurrency = 'TRY';
    }

    // Validate against API requirements (3+ characters)
    if (!validCurrencies.includes(normalizedCurrency) || normalizedCurrency.length < 3) {
      console.warn(`Invalid currency ${currency}, defaulting to TRY`);
      normalizedCurrency = 'TRY';
    }

    currency = normalizedCurrency;
    console.log('💱 Using normalized currency:', currency);

    // Validate date format (should be YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(searchParams.fromDate) || !dateRegex.test(searchParams.toDate)) {
      throw new Error('Invalid date format. Expected YYYY-MM-DD');
    }

    // Build query parameters
    const queryParams = new URLSearchParams({
      fromdate: searchParams.fromDate,
      todate: searchParams.toDate,
      adult: searchParams.adults.toString(),
      currency: currency,
      language,
      onlybestoffer: 'false'
    });

    // Add child ages as comma-separated string
    if (searchParams.children.length > 0) {
      const childAges = searchParams.children
        .filter(child => child.age >= 1 && child.age <= 17)
        .map(child => child.age.toString())
        .join(',');
      
      if (childAges) {
        queryParams.append('childage', childAges);
      }
    } else {
      queryParams.append('childage', '');
    }

    console.log('🔗 API Request URL:', `${API_BASE_URL}/hotel/${HOTEL_ID}/price?${queryParams.toString()}`);

    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/price?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
        cache: 'no-store' // NO CACHE - Real-time pricing
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API Error Response:', errorText);
      throw new Error(`Failed to fetch price offers: ${response.status} ${response.statusText}`);
    }

    const data: PriceOffer[] = await response.json();
    console.log('✅ Price offers loaded from API (Real-time)');
    console.log(`📊 Found ${data.length} price offers`);
    
    return data;
  } catch (error) {
    console.error('❌ Error fetching price offers:', error);
    throw new Error('Failed to load room availability and prices');
  }
}

/**
 * Create a new reservation - REAL API CALL
 * SERVER-SIDE API CALL - NO CACHE
 */
export async function createReservation(
  reservationData: ReservationRequest
): Promise<ReservationResponse> {
  try {
    console.log('🌐 API CALL: createReservation - Server-side');
    console.log('📝 Reservation data:', JSON.stringify(reservationData, null, 2));
    
    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/createReservation`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reservationData),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Reservation API Error Response:', errorText);
      throw new Error(`Failed to create reservation: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data: ReservationResponse = await response.json();
    console.log('✅ Reservation created successfully:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error creating reservation:', error);
    throw new Error('Failed to create reservation');
  }
}

/**
 * Update an existing reservation - NEW API CALL
 * SERVER-SIDE API CALL - NO CACHE
 */
export async function updateReservation(
  reservationData: UpdateReservationRequest
): Promise<UpdateReservationResponse> {
  try {
    console.log('🌐 API CALL: updateReservation - Server-side');
    console.log('📝 Update reservation data:', JSON.stringify(reservationData, null, 2));
    
    const response = await fetch(
      `${API_BASE_URL}/hotel/${HOTEL_ID}/updateReservation`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(reservationData),
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Update Reservation API Error Response:', errorText);
      throw new Error(`Failed to update reservation: ${response.status} ${response.statusText}. ${errorText}`);
    }

    const data: UpdateReservationResponse = await response.json();
    console.log('✅ Reservation updated successfully:', data);
    
    return data;
  } catch (error) {
    console.error('❌ Error updating reservation:', error);
    throw new Error('Failed to update reservation');
  }
}

/**
 * Group price offers by room type
 */
export function groupPriceOffersByRoomType(
  priceOffers: PriceOffer[],
  roomTypes: any[]
): RoomTypeWithPrices[] {
  const groupedOffers: { [key: number]: PriceOffer[] } = {};
  
  // Group offers by room-type-id
  priceOffers.forEach(offer => {
    const roomTypeId = offer["room-type-id"];
    if (!groupedOffers[roomTypeId]) {
      groupedOffers[roomTypeId] = [];
    }
    groupedOffers[roomTypeId].push(offer);
  });

  // Create RoomTypeWithPrices array
  const result: RoomTypeWithPrices[] = [];
  
  roomTypes.forEach(roomType => {
    const roomTypeId = roomType["room-id"];
    const offers = groupedOffers[roomTypeId] || [];
    
    if (offers.length > 0) {
      const prices = offers.map(offer => offer["discounted-price"] || offer.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const currency = offers[0].currency;

      result.push({
        roomType,
        priceOffers: offers,
        minPrice,
        maxPrice,
        currency
      });
    } else {
      // Include room types without offers for display
      result.push({
        roomType,
        priceOffers: [],
        minPrice: 0,
        maxPrice: 0,
        currency: 'TRY'
      });
    }
  });

  return result;
}

/**
 * Helper function to format dates for API requests
 */
export function formatDateForAPI(date: Date): string {
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

/**
 * Helper function to build search parameters from form data
 */
export function buildSearchParams(
  checkIn: Date,
  checkOut: Date,
  adults: number,
  childAges: number[]
): SearchParams {
  return {
    fromDate: formatDateForAPI(checkIn),
    toDate: formatDateForAPI(checkOut),
    adults,
    children: childAges.map(age => ({ age }))
  };
}

/**
 * Get detailed information for a specific hotel
 * SERVER-SIDE API CALL - Cached for 1 hour
 */
export async function getHotelDetails(hotelId: number, language: string = 'TR'): Promise<HotelParams> {
  try {
    console.log('🌐 API CALL: getHotelDetails - Server-side');
    const response = await fetch(
      `${API_BASE_URL}/hotel/${hotelId}/params?language=${language}`,
      {
        headers: getAuthHeaders(),
        next: { revalidate: 3600 } // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch hotel details: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Hotel details loaded from API');
    return data;
  } catch (error) {
    console.error('❌ Error fetching hotel details:', error);
    throw new Error('Failed to load hotel details');
  }
}
