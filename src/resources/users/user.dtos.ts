import { UserRole } from '../../helpers/constants';
import IUser from './user.interface';


export interface SignupDTO {
  password: string;
  email: string;
  business_name?: string;
  role?: UserRole;
  medical_history?: any
  dob?: Date
  ip?:any
  referrerCode?: any
}

export interface LoginDTO {
  user: IUser;
  tokens: {
    accessToken: string,
    refreshToken: string,
  }
}

export interface s {
  email: string,
  message: string,
}

export interface updateProfileDTO {
  full_name?: string;
  dob?: string;
}

