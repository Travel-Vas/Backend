import jwt from "jsonwebtoken";
import { JWT_SECRET_KEY, UserRole } from '../../constants';

export interface Token {
  id: string;
  role: UserRole
  expiresIn: number
}

export const createToken = (id: string, role: string, expires = '30d'):string  => {
  return jwt.sign({id: id, role}, JWT_SECRET_KEY as jwt.Secret, {
    expiresIn: expires
  })
}

export const verifyToken = async (token:string): Promise<jwt.VerifyErrors | Token> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET_KEY, (err, payload) => {
      if(err) return reject(err)

      resolve(payload as Token)
    })
  })
}

export default { verifyToken}
