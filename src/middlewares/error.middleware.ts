import { NextFunction, Request } from 'express';
import { CustomError, CustomResponse } from '../helpers/lib/App';
import { NODE_ENV, ResponseMessage } from '../helpers/constants';
import multer from 'multer';

export const errorHandler = (
  err: Error,
  req: Request,
  res: CustomResponse<any>,
  next: NextFunction,
) => {
  console.log(err)
  if (err instanceof CustomError) {
    const { statusCode, message, logging, error } = err;
    if (NODE_ENV == 'development') {
      console.log(error)
      // logger.error(
      //   JSON.stringify({
      //     code: statusCode,
      //     errors: error,
      //     stack: err.stack,
      //   }),
      // );
    }else {
      console.log(error.ctx)
      // logger.error('', { data: error.ctx})
    }
    return res.status(statusCode).json({
      msg: message,
      statusCode,
      data: [],
    });
  }

  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      msg: 'Incorrect file field',
      statusCode: 400,
      data: [],
    });
  }

  return res.status(500).json({
    msg: ResponseMessage.INTERNAL_SERVER_ERROR,
    statusCode: 500,
    data: [],
  });
};
