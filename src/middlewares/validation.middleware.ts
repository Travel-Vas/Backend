import { NextFunction, Request } from 'express';
import { CustomResponse } from '../helpers/lib/App';
import Joi from 'joi';
import { ResponseMessage } from '../helpers/constants';

export function validationMiddleware(schema: Joi.Schema) {
  return async (req: Request, res: CustomResponse<any>, next: NextFunction) => {
    const validationOptions = {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: true,
    };
    try {
      req.body = await schema.validateAsync({ ...req.body, ...req.params }, validationOptions);
      next();
    } catch (e: any) {
      const errors: any[] = [];
      e.details.forEach((error: Joi.ValidationErrorItem) => {
        errors.push({message:  error.message.replace(/\\"|"/g, ''), path: error.path[0] });
      });
      return res.status(400).json({
        msg: ResponseMessage.BAD_REQUEST,
        statusCode: 400,
        data: errors,
      });
    }
  };
}
