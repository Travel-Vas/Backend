import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../helpers/lib/App';
import userModel from '../resources/users/user.model';
import { Token, verifyToken } from '../helpers/lib/App';
import jwt from 'jsonwebtoken';
import { UserRole } from '../helpers/constants';

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<Response | void> {
  try {
    // Extract the bearer token from the authorization header
    const bearer = req.headers.authorization;
    // console.log(req.cookies);
    // console.log(bearer);

    // Check if the authorization header contains a valid Bearer token
    if (!bearer || !bearer.startsWith('Bearer')) {
      return next(
        new CustomError({ 
          message: 'Unauthorized Access', 
          code: 401, 
          ctx: { data: 'Invalid bearer token' } 
        })
      );
    }

    // Extract the access token from the Bearer token
    const accessToken = bearer.split('Bearer ')[1].trim();

    // Verify the access token
    const accessPayload: Token | jwt.JsonWebTokenError = await verifyToken(accessToken);
    if (accessPayload instanceof jwt.JsonWebTokenError) {
      return next(
        new CustomError({ 
          message: 'Access token invalid', 
          code: 401, 
          ctx: { data: 'Invalid bearer token' } 
        })
      );
    }

    // Verify the refresh token from the cookies
    const refreshPayload = await verifyToken(req.cookies.refresh_token);
    if (refreshPayload instanceof jwt.JsonWebTokenError) {
      return next(
        new CustomError({ 
          message: 'Refresh token expired', 
          code: 403, 
          ctx: { data: 'Refresh token expired' } 
        })
      );
    }

    // console.log('Access payload:', accessPayload);

    // Fetch the user from the database using the refresh token's payload
    const user = await userModel.findOne(
      { _id: refreshPayload.id }, 
      { __v: 0, password: 0 }
    );

    if (!user) {
      return next(
        new CustomError({ 
          message: 'Access token invalid', 
          code: 401, 
          ctx: { data: 'Invalid bearer token' } 
        })
      );
    }

    // Attach the user to the request object, stripping the password field
    req.user = user.toObject({
      transform: (doc, ret) => {
        delete ret.password;
        return ret;
      }
    });

    // Proceed to the next middleware
    next();
  } catch (error) {
    // Handle errors that may occur during token verification or database lookup
    return next(
      new CustomError({
        message: 'Unauthorized Access',
        code: 401,
        ctx: { data: 'Invalid bearer token' },
      })
    );
  }
}
export function restrictTo(...roles: [UserRole]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) throw new CustomError({ message: 'Forbidden', code: 403 })

    if (!roles.includes(req.user.role)) throw new CustomError({ message: 'Forbidden', code: 403 })

    next()
  }
}