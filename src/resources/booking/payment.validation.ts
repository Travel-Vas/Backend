import Joi from 'joi';

export const initializeFullPaymentSchema = Joi.object({
    tripId: Joi.string().required().messages({
        'string.base': 'Trip ID must be a string',
        'any.required': 'Trip ID is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});

export const initializeInstallmentPaymentSchema = Joi.object({
    tripId: Joi.string().required().messages({
        'string.base': 'Trip ID must be a string',
        'any.required': 'Trip ID is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    }),
    installmentCount: Joi.number().integer().min(2).max(12).required().messages({
        'number.base': 'Installment count must be a number',
        'number.integer': 'Installment count must be an integer',
        'number.min': 'Installment count must be at least 2',
        'number.max': 'Installment count must be at most 12',
        'any.required': 'Installment count is required'
    }),
    frequency: Joi.string().valid('weekly', 'monthly', 'quarterly').default('monthly').messages({
        'any.only': 'Frequency must be one of: weekly, monthly, quarterly'
    })
});

export const verifyPaymentSchema = Joi.object({
    reference: Joi.string().required().messages({
        'string.base': 'Reference must be a string',
        'any.required': 'Payment reference is required'
    })
});

export const processInstallmentSchema = Joi.object({
    paymentId: Joi.string().required().messages({
        'string.base': 'Payment ID must be a string',
        'any.required': 'Payment ID is required'
    }),
    email: Joi.string().email().required().messages({
        'string.email': 'Please provide a valid email address',
        'any.required': 'Email is required'
    })
});