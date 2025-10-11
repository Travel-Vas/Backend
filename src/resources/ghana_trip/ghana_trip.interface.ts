export interface ITransportDetails {
    type: string;
    price: number;
    label: string;
}

export interface IHotelDetails {
    id: string;
    name: string;
    country: string;
    pricePerNight: number;
    currency: string;
    rating: number;
}

export interface ITourDetails {
    id: string;
    country: string;
    price: number;
    sites: string[];
}

export interface IEntryRequirements {
    hasPassport: boolean;
    isVirginPassport: boolean;
    hasYellowCard: boolean;
    needsYellowCardProcurement: boolean | null;
}

export interface IBookingData {
    flowType: string;
    transport: ITransportDetails;
    conferenceHotel?: IHotelDetails;
    selectedTours: ITourDetails[];
    tourHotels: {
        [key: string]: IHotelDetails;
    };
    roomSharing: boolean;
    intraCityLogistics: boolean;
    skipAccommodation: boolean;
    entryRequirements: IEntryRequirements;
}

export interface IPricing {
    subtotal: number;
    borderProtocol: number;
    contingency: number;
    serviceCharge: number;
    total: number;
}

export interface IGhanaTripBooking {
    userId?: string;
    email?: string;
    bookingData: IBookingData;
    pricing: IPricing;
    timestamp: string;
    userAgent?: string;

    // Payment details (added by backend)
    paymentReference?: string;
    paymentStatus?: 'pending' | 'success' | 'failed';
    paystackResponse?: any;
    paidAt?: Date;
}
