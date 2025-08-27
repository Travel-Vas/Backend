import IUser from '../../../resources/users/user.interface';

declare global {
  namespace Express {
    export interface Request {
      user: IUser;
      photographerInfo: any
      isPhotographerSubdomain: boolean
      isTest: boolean;
    }
  }
}
