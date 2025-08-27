export interface ITrip {
    name: string
    destination: string
    const : string
    type: tripType
    startDate: Date
    endDate: Date
    transportType: transportType
    accommodation: Accommodation
    interests: string[]
    description: string
    firstName: string
    lastName: string
    otherName: string
    phoneNumber: string
    email: string
    documents: string[]
    tripCost: string
    status:tripStatus
    userId:any
}

export enum  tripStatus {
    CANCELED = 'CANCELED',
    COMPLETED = 'COMPLETED',
    INPROGRESS = 'INPROGRESS',
    PENDING = 'PENDING'
}

export enum transportType {
    FLIGHT = 'FLIGHT',
    TRAIN = 'TRAIN',
    BUS = 'BUS',
}
export enum Accommodation {
    HOTEL = 'HOTEL',
    APARTMENT = 'APARTMENT',
    RESORT = 'RESORT'
}
export enum tripType {
    SOLO    =  'SOLO',
    GROUP = 'GROUP',
    FAMILY='FAMILY',
    BUSINESS='BUSINESS',
    LEISURE='LEISURE'
}

export interface ITripLoger {
    tripId: any,
    userId: any
}

export interface IEvents {
    createdBy: any
    name: string
    fee: string
    offerValidationDate: Date
    location: string
    attendees: number
}