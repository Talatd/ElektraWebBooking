// Hotel Parameters Types
export interface HotelParams {
  id: number;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  images: HotelApiImage[]; // API'den gelen gerçek image yapısı
  facilities: Facility[];
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  reviewCount?: number;
}

// API'den gelen gerçek image yapısı
export interface HotelApiImage {
  id: number;
  url: string;
  title?: string;
  description?: string;
  "image-type"?: string;
  "is-main"?: boolean;
  order?: number;
}

// ImageGallery component'i için uyumlu yapı
export interface HotelImage {
  id: number;
  url: string;
  title: string;
  description?: string;
  isMain: boolean;
}

// Hotel Definitions Types
export interface HotelDefinitions {
  roomTypes: RoomType[];
  bedTypes: BedType[];
  boardTypes: BoardType[];
  facilities: Facility[];
}

export interface BedType {
  id: number;
  name: string;
  capacity: number;
}

// Real API Room Types from your response
export interface RoomDefinitionsResponse {
  roomtype: RoomType[];
  boardtypes: BoardType[];
  ratetypes: RateType[];
}

export interface RoomType {
  "room-id": number;
  "room-group-id": number | null;
  "room-name": string;
  "room-code": string;
  "room-property": string | null;
  "room-image-url": string;
  "room-bed-options": string | null;
  "room-area": number | null;
  "room-level": number;
  "room-rules": {
    "max-adult-capacity": number;
    "max-child-capacity": number | null;
    "min-child-capacity": number | null;
    "max-baby-capacity": number | null;
    "max-pax-capacity": number;
  };
  "room-has-wifi": boolean;
  "room-has-safe": boolean;
  "room-has-private-bath": boolean;
  "room-has-hairdryer": boolean;
  "room-has-balcony": boolean;
  "room-amenity": RoomAmenity[];
  "room-images": string[];
  "room-longitude": number | null;
  "room-latitude": number | null;
}

export interface RoomAmenity {
  name: string;
  "group-name": string;
  "group-icon": number;
}

export interface BoardType {
  id: number;
  name: string;
  code: string;
  "sys-code": string;
  description: string;
}

export interface RateType {
  id: number;
  code: string;
  "pay-now-percent": number;
  "min-los": number | null;
  "max-los": number | null;
  "cancellation-possible": boolean;
  "bookable-before-days": number;
  "days-before-arrival": number;
  "period-in-days": number | null;
  "payment-information": string;
  "cancel-policy": string;
}

// Price API Types - Real API Structure
export interface PriceOffer {
  id: string;
  "hotel-id": number;
  "room-type-id": number;
  "room-type": string;
  "board-type-id": number;
  "board-type": string;
  "rate-type-id": number;
  "rate-type": string;
  "rate-code-id": number;
  "rate-code": string;
  "price-agency-id": number;
  "room-count"?: number;
  "room-tosell": number;
  "stop-sell": boolean;
  "stop-sell-closed-to-arrival": boolean;
  "stop-sell-closed-to-departure": boolean;
  "min-los": number | null;
  "max-los": number | null;
  "bookable-after-days": number | null;
  price: number;
  "currency-id": number;
  currency: string;
  "commission-percent": number;
  "discount-percent": number;
  "discount-amount": number;
  "promotion-percent": number;
  "promotion-amount": number;
  "discounted-price": number;
  "cancellation-penalty": {
    description: string;
    "period-in-days": number | null;
    "penalty-percentage": number | null;
    "is-refundable": boolean;
  };
}

// Grouped price offers by room type
export interface RoomTypeWithPrices {
  roomType: RoomType;
  priceOffers: PriceOffer[];
  minPrice: number;
  maxPrice: number;
  currency: string;
}

// Price Offers Response
export interface PriceOffersResponse {
  offers: PriceOffer[];
  searchParams: SearchParams;
  currency: string;
}

// Reservation Types - Real API Structure
export interface ReservationRequest {
  "hotel-id": number;
  "rate-type-id": number;
  "board-type-id": number;
  "rate-code-id": number;
  "room-type-id": number;
  "room-id"?: number;
  "currency-code": string;
  "total-price": number;
  "price-agency-id": number;
  "adult-count": number;
  nationality: string;
  "check-in": string; // YYYY-MM-DD
  "check-out": string; // YYYY-MM-DD
  "market-id"?: number;
  "elder-child-count"?: number;
  "younger-child-count"?: number;
  "baby-count"?: number;
  "guest-list": GuestInfo[];
  "res-notes"?: string;
  "room-count"?: number;
  "contact-first-name"?: string;
  "contact-last-name"?: string;
  "contact-email"?: string;
  "contact-phone"?: string;
  "seller-commission"?: number;
  "voucher-no"?: string;
  "payment-type"?: number; // 2 = NOT PAID, 3 = PAID
  "tax-company"?: string;
  "tax-no"?: string;
  "tax-place"?: string;
  "tax-address"?: string;
  "tax-type"?: number; // 1 = company, 2 = personal
}

// NEW: Update Reservation Types
export interface UpdateReservationRequest {
  "hotel-id": number;
  "reservation-id": number;
  "rate-type-id": number;
  "board-type-id": number;
  "room-type-id": number;
  "rate-code-id": number;
  "room-id"?: number;
  "currency-code": string;
  "total-price": number;
  "price-agency-id": number;
  "adult-count": number;
  nationality: string;
  "check-in": string; // YYYY-MM-DD
  "check-out": string; // YYYY-MM-DD
  "market-id"?: number;
  "elder-child-count"?: number;
  "younger-child-count"?: number;
  "baby-count"?: number;
  "guest-list": GuestInfo[];
  "room-count"?: number;
  "agency-commission"?: number;
  "voucher-no"?: string;
  "seller-commission"?: number;
  "promo-code"?: string;
  "use-guest-bonus"?: boolean;
  "is-offer"?: boolean;
}

export interface GuestInfo {
  "title-id": number; // 0 = MR, 1 = MS, 2 = CHILD, 3 = BABY
  gender?: number; // 0 = Male, 1 = Female
  country?: string;
  name: string;
  surname: string;
  birthday?: string; // YYYY-MM-DD (required for children and babies)
  "nationality-no"?: string;
  "passport-no"?: string;
  email?: string;
  phone?: string;
}

export interface ReservationResponse {
  success: boolean;
  "reservation-id": number;
}

// NEW: Update Reservation Response
export interface UpdateReservationResponse {
  success: boolean;
  "reservation-id": number;
  message?: string;
}

// Form Types for Reservation
export interface ReservationFormData {
  // Guest Information
  contactFirstName: string;
  contactLastName: string;
  contactEmail: string;
  contactPhone: string;
  nationality: string;
  
  // Guests
  guests: GuestFormData[];
  
  // Additional Information
  notes?: string;
  
  // Tax Information (optional)
  taxType?: 'personal' | 'company';
  taxCompany?: string;
  taxNo?: string;
  taxAddress?: string;
}

// NEW: Update Reservation Form Data
export interface UpdateReservationFormData extends ReservationFormData {
  reservationId: number;
  voucherNo?: string;
  promoCode?: string;
  useGuestBonus?: boolean;
  isOffer?: boolean;
}

export interface GuestFormData {
  title: 'mr' | 'ms' | 'child' | 'baby';
  firstName: string;
  lastName: string;
  birthday?: string; // Required for children and babies
  gender?: 'male' | 'female';
  email?: string;
  phone?: string;
  nationalityNo?: string;
  passportNo?: string;
}

// Legacy types for compatibility
export interface RoomOffer {
  id: string;
  roomTypeId: number;
  roomName: string;
  boardType: BoardType;
  rateType: RateType;
  price: {
    total: number;
    perNight: number;
    currency: string;
  };
  availability: number;
  images: string[];
  facilities: RoomAmenity[];
}

export interface SearchParams {
  fromDate: string;
  toDate: string;
  adults: number;
  children: ChildAge[];
}

export interface ChildAge {
  age: number;
}

// Form Types
export interface BookingSearchForm {
  checkIn: Date;
  checkOut: Date;
  adults: number;
  children: number;
  childAges: number[];
}

// Filter Types for Room Offers
export interface RoomFilterState {
  priceRange: [number, number];
  boardTypes: string[];
  roomTypes: number[];
  cancellationPolicy: 'all' | 'refundable' | 'non-refundable';
  sortBy: 'price' | 'roomType' | 'boardType';
  sortOrder: 'asc' | 'desc';
}

export interface Facility {
  id: number;
  name: string;
  icon?: string;
  category: string;
}

// NEW: Reservation Management Types
export interface ReservationDetails {
  "reservation-id": number;
  "hotel-id": number;
  "room-type-id": number;
  "room-type": string;
  "board-type-id": number;
  "board-type": string;
  "rate-type-id": number;
  "rate-type": string;
  "check-in": string;
  "check-out": string;
  "adult-count": number;
  "elder-child-count": number;
  "younger-child-count": number;
  "baby-count": number;
  "total-price": number;
  "currency-code": string;
  nationality: string;
  "guest-list": GuestInfo[];
  "voucher-no"?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  "created-at": string;
  "updated-at": string;
}
