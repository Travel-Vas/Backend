"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGhanaTripBookingSchema = exports.verifyGhanaTripPaymentSchema = exports.createGhanaTripBookingSchema = void 0;
const joi_1 = __importDefault(require("joi"));
const transportDetailsSchema = joi_1.default.object({
    type: joi_1.default.string().required().messages({
        'any.required': 'Transport type is required'
    }),
    price: joi_1.default.number().positive().required().messages({
        'number.positive': 'Transport price must be positive',
        'any.required': 'Transport price is required'
    }),
    label: joi_1.default.string().required().messages({
        'any.required': 'Transport label is required'
    })
});
const hotelDetailsSchema = joi_1.default.object({
    id: joi_1.default.string().required().messages({
        'any.required': 'Hotel ID is required'
    }),
    name: joi_1.default.string().required().messages({
        'any.required': 'Hotel name is required'
    }),
    country: joi_1.default.string().required().messages({
        'any.required': 'Hotel country is required'
    }),
    pricePerNight: joi_1.default.number().positive().required().messages({
        'number.positive': 'Price per night must be positive',
        'any.required': 'Price per night is required'
    }),
    currency: joi_1.default.string().required().messages({
        'any.required': 'Currency is required'
    }),
    rating: joi_1.default.number().min(0).max(10).required().messages({
        'number.min': 'Rating must be at least 0',
        'number.max': 'Rating must be at most 10',
        'any.required': 'Hotel rating is required'
    })
});
const tourDetailsSchema = joi_1.default.object({
    id: joi_1.default.string().required().messages({
        'any.required': 'Tour ID is required'
    }),
    country: joi_1.default.string().required().messages({
        'any.required': 'Tour country is required'
    }),
    price: joi_1.default.number().positive().required().messages({
        'number.positive': 'Tour price must be positive',
        'any.required': 'Tour price is required'
    }),
    sites: joi_1.default.array().items(joi_1.default.string()).default([]).messages({
        'array.base': 'Sites must be an array'
    })
});
const entryRequirementsSchema = joi_1.default.object({
    hasPassport: joi_1.default.boolean().required().messages({
        'any.required': 'Passport status is required'
    }),
    isVirginPassport: joi_1.default.boolean().required().messages({
        'any.required': 'Virgin passport status is required'
    }),
    hasYellowCard: joi_1.default.boolean().required().messages({
        'any.required': 'Yellow card status is required'
    }),
    needsYellowCardProcurement: joi_1.default.boolean().allow(null).optional()
});
const bookingDataSchema = joi_1.default.object({
    flowType: joi_1.default.string().required().messages({
        'any.required': 'Booking flow type is required'
    }),
    transport: transportDetailsSchema.required(),
    conferenceHotel: hotelDetailsSchema.optional(),
    selectedTours: joi_1.default.array().items(tourDetailsSchema).default([]),
    tourHotels: joi_1.default.object().pattern(joi_1.default.string(), hotelDetailsSchema).default({}),
    roomSharing: joi_1.default.boolean().default(false),
    intraCityLogistics: joi_1.default.boolean().default(false),
    skipAccommodation: joi_1.default.boolean().default(false),
    entryRequirements: entryRequirementsSchema.required()
});
const pricingSchema = joi_1.default.object({
    subtotal: joi_1.default.number().min(0).required().messages({
        'number.min': 'Subtotal cannot be negative',
        'any.required': 'Subtotal is required'
    }),
    borderProtocol: joi_1.default.number().min(0).default(0),
    contingency: joi_1.default.number().min(0).default(0),
    serviceCharge: joi_1.default.number().min(0).required().messages({
        'number.min': 'Service charge cannot be negative',
        'any.required': 'Service charge is required'
    }),
    total: joi_1.default.number().positive().required().messages({
        'number.positive': 'Total must be positive',
        'any.required': 'Total is required'
    })
});
exports.createGhanaTripBookingSchema = joi_1.default.object({
    bookingData: bookingDataSchema.required(),
    pricing: pricingSchema.required(),
    timestamp: joi_1.default.string().isoDate().required().messages({
        'string.isoDate': 'Timestamp must be a valid ISO date',
        'any.required': 'Timestamp is required'
    }),
    userAgent: joi_1.default.string().optional()
});
exports.verifyGhanaTripPaymentSchema = joi_1.default.object({
    reference: joi_1.default.string().required().messages({
        'string.base': 'Reference must be a string',
        'any.required': 'Payment reference is required'
    })
});
exports.getGhanaTripBookingSchema = joi_1.default.object({
    bookingId: joi_1.default.string().required().messages({
        'string.base': 'Booking ID must be a string',
        'any.required': 'Booking ID is required'
    })
});
