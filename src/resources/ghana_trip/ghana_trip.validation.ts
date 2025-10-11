import Joi from 'joi';

const transportDetailsSchema = Joi.object({
    type: Joi.string().required().messages({
        'any.required': 'Transport type is required'
    }),
    price: Joi.number().positive().required().messages({
        'number.positive': 'Transport price must be positive',
        'any.required': 'Transport price is required'
    }),
    label: Joi.string().required().messages({
        'any.required': 'Transport label is required'
    })
});

const hotelDetailsSchema = Joi.object({
    id: Joi.string().required().messages({
        'any.required': 'Hotel ID is required'
    }),
    name: Joi.string().required().messages({
        'any.required': 'Hotel name is required'
    }),
    country: Joi.string().required().messages({
        'any.required': 'Hotel country is required'
    }),
    pricePerNight: Joi.number().positive().required().messages({
        'number.positive': 'Price per night must be positive',
        'any.required': 'Price per night is required'
    }),
    currency: Joi.string().required().messages({
        'any.required': 'Currency is required'
    }),
    rating: Joi.number().min(0).max(10).required().messages({
        'number.min': 'Rating must be at least 0',
        'number.max': 'Rating must be at most 10',
        'any.required': 'Hotel rating is required'
    })
});

const tourDetailsSchema = Joi.object({
    id: Joi.string().required().messages({
        'any.required': 'Tour ID is required'
    }),
    country: Joi.string().required().messages({
        'any.required': 'Tour country is required'
    }),
    price: Joi.number().positive().required().messages({
        'number.positive': 'Tour price must be positive',
        'any.required': 'Tour price is required'
    }),
    sites: Joi.array().items(Joi.string()).default([]).messages({
        'array.base': 'Sites must be an array'
    })
});

const entryRequirementsSchema = Joi.object({
    hasPassport: Joi.boolean().required().messages({
        'any.required': 'Passport status is required'
    }),
    isVirginPassport: Joi.boolean().required().messages({
        'any.required': 'Virgin passport status is required'
    }),
    hasYellowCard: Joi.boolean().required().messages({
        'any.required': 'Yellow card status is required'
    }),
    needsYellowCardProcurement: Joi.boolean().allow(null).optional()
});

const bookingDataSchema = Joi.object({
    flowType: Joi.string().required().messages({
        'any.required': 'Booking flow type is required'
    }),
    transport: transportDetailsSchema.required(),
    conferenceHotel: hotelDetailsSchema.optional(),
    selectedTours: Joi.array().items(tourDetailsSchema).default([]),
    tourHotels: Joi.object().pattern(
        Joi.string(),
        hotelDetailsSchema
    ).default({}),
    roomSharing: Joi.boolean().default(false),
    intraCityLogistics: Joi.boolean().default(false),
    skipAccommodation: Joi.boolean().default(false),
    entryRequirements: entryRequirementsSchema.required()
});

const pricingSchema = Joi.object({
    subtotal: Joi.number().min(0).required().messages({
        'number.min': 'Subtotal cannot be negative',
        'any.required': 'Subtotal is required'
    }),
    borderProtocol: Joi.number().min(0).default(0),
    contingency: Joi.number().min(0).default(0),
    serviceCharge: Joi.number().min(0).required().messages({
        'number.min': 'Service charge cannot be negative',
        'any.required': 'Service charge is required'
    }),
    total: Joi.number().positive().required().messages({
        'number.positive': 'Total must be positive',
        'any.required': 'Total is required'
    })
});

export const createGhanaTripBookingSchema = Joi.object({
    bookingData: bookingDataSchema.required(),
    pricing: pricingSchema.required(),
    timestamp: Joi.string().isoDate().required().messages({
        'string.isoDate': 'Timestamp must be a valid ISO date',
        'any.required': 'Timestamp is required'
    }),
    userAgent: Joi.string().optional()
});

export const verifyGhanaTripPaymentSchema = Joi.object({
    reference: Joi.string().required().messages({
        'string.base': 'Reference must be a string',
        'any.required': 'Payment reference is required'
    })
});

export const getGhanaTripBookingSchema = Joi.object({
    bookingId: Joi.string().required().messages({
        'string.base': 'Booking ID must be a string',
        'any.required': 'Booking ID is required'
    })
});
