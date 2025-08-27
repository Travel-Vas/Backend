import DateExtension from '@joi/date';
import * as JoiImport from 'joi';
const Joi = JoiImport.extend(DateExtension);
import moment from 'moment';

import { ResendOTPType, UserRole } from '../../helpers/constants';

export const createUserSchema = Joi.object({
  password: Joi.string().required().min(4),
  role: Joi.string().valid(UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN),
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string(),
    referrerCode: Joi.string()
        .allow('', null) // ✅ allow empty string and null
        .optional(),
})

export const resendOTPSchema = Joi.object({
  email: Joi.string().required(),
  otpType: Joi.string().required().valid(...Object.values(ResendOTPType)),
})

export const addShippingAddressSchema = Joi.object({
  addresses: Joi.array().items(Joi.string()).required()
})

export const deleteShippingAddressSchema = Joi.object({
  index: Joi.number().required()
})

export const verifyAccountSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.string().required(),
})


export const loginSchema = Joi.object({
  email: Joi.string().required(),
  password: Joi.string().required().min(8),
})

export const updateProfileSchema = Joi.object({
    dob: Joi.date().format('DD-MM-YYYY'),  // Date of birth
    full_name: Joi.string().optional(),  // Full name
    phone: Joi.string().optional(),  // Phone number
    website: Joi.string().uri().optional(),  // Website URL (valid URI format)
    extra_picture_price: Joi.number().optional(),
    business_country: Joi.string().optional(),  // Business country
    business_address: Joi.string().optional(),  // Business address
    business_state: Joi.string().optional(),  // Business state
    business_city: Joi.string().optional(),  // Business city
    instagram: Joi.string().optional(),  // Instagram profile URL (or username)
    facebook: Joi.string().optional(),  // Facebook profile URL (or username)
    linkedin: Joi.string().optional(),  // LinkedIn profile URL (or username)
    twitter: Joi.string().optional(),  // Twitter profile URL (or username)
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().required(),
  otp: Joi.string().required(),
})
export const resetPasswordsSchema = Joi.object({
  email: Joi.string()
      .email()
      .required()
      .messages({
        'string.email': 'Please enter a valid email address.',
        'any.required': 'Email is required to reset your password.'
      }),  // Ensure email is in a valid format

  password: Joi.string()
      .min(6)
      .required()
      .messages({
        'string.min': 'Password must be at least 6 characters long.',
        'any.required': 'Password is required.'
      }),  // Ensure the password is at least 6 characters

  confirm_password: Joi.string()
      .valid(Joi.ref('password'))
      .required()
      .messages({
        'any.only': 'Password and confirmation must match.',
        'any.required': 'Please confirm your password.'
      })  // Ensure password and confirm_password match
});


export const clientAccessKeyValidation = Joi.object({
  access_key: Joi.string().required()
})

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().required(),
})

export const updatePasswordSchema = Joi.object({
  old_password: Joi.string().required().min(8),
  new_password: Joi.string().required().min(8)
})

export const updateBankDetailsSchema = Joi.object({
  account_no: Joi.string().required().min(10).max(10),
  bank_code: Joi.string().required()
})

export const onboardingSchema = Joi.object({
    country: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'Country is required',
        'string.min': 'Country must be at least 2 characters long',
        'string.max': 'Country must not exceed 50 characters',
        'any.required': 'Country is required'
    }),
    state: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'State is required',
        'string.min': 'State must be at least 2 characters long',
        'string.max': 'State must not exceed 50 characters',
        'any.required': 'State is required'
    }),
    city: Joi.string().trim().min(2).max(50).required().messages({
        'string.empty': 'City is required',
        'string.min': 'City must be at least 2 characters long',
        'string.max': 'City must not exceed 50 characters',
        'any.required': 'City is required'
    }),
});
