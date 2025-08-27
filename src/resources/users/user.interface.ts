import { Document } from 'mongoose';
import { ResendOTPType, UserRole } from '../../helpers/constants';
import { SignupDTO, LoginDTO } from './user.dtos';

export default interface IUser {
  _id: string;
  password?: string;
  email: string;
  name: string;
  dob?: Date;
  phone?: string;
  extra_picture_price?: number
  profile_image: any;
  role: UserRole;
  status: boolean;
  is_verified: boolean;
  last_login: Date;
  country?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  currency?: any
  isDeleted?: boolean
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  stripeCustomerId?: string;
  pop_up_shown?: boolean
  upload_size?: number
  referralCode?: any
  suspended?: any
  isSuspended?: boolean
  suspendedAt?: string
  suspensionReason?: string
  isUnboarded?: boolean
}
export interface BrevoContactPayload {
  email: string;
  ext_id: string;
  attributes: {
    BUSINESS_NAME: string;
    ROLE: string;
    REFERENCE_CODE: string;
    STATUS: string;
    COUNTRY: string;
    STATE: string;
    CITY: string;
  };
  emailBlacklisted: boolean;
  smsBlacklisted: boolean;
  updateEnabled: boolean;
  listIds: number[];
}

export enum suspendedDto {

}
export interface updateProfileDTO {
  full_name?: string;
  dob?: string;
  phone?: string;
}

export interface UnVerifiedUserDto {
  email: string,
  message: string,
}

export interface ISignup {
  (user: SignupDTO): Promise<string>
}

export interface IVerifyAccount {
  (user_email: string, otp: string): Promise<LoginDTO>
}

export interface IResendOTP {
  (user_email: string, otpType: ResendOTPType): Promise<string>
}

export interface IVerifyAccount {
  (user_email: string, otp: string): Promise<LoginDTO>
}

export interface IResendOTP {
  (user_email: string, otpType: ResendOTPType): Promise<string>
}

export interface IForgotPassword {
  (user_email: string): Promise<string>
}

export interface IResetPassword {
  (user_email: string, otp: string, new_password?: string): Promise<string>
}

export interface ILogin {
  (username: string, password: string): Promise<LoginDTO | UnVerifiedUserDto>
}

export interface IUpdateProfile {
  (user_id: string, data: updateProfileDTO): Promise<Partial<IUser> | null>
}

export interface IUpdatePassword {
  (user_id: string, old_password: string, new_password: string): Promise<{ access_token: string, refresh_token: string }>
}

export interface IDeleteAccount {
  (user_id: string, password: string): Promise<{ refresh_token: string }>
}

