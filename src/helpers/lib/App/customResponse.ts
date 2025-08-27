import { Response } from 'express';
import { ReasonPhrases, StatusCodes } from 'http-status-codes';
import { ResponseMessage } from '../../constants';
import { Send } from 'express-serve-static-core';
export interface responseData<T> {
  msg?: ResponseMessage | string;
  data: T | T[];
  statusCode?: StatusCodes;
}

// Declare a custom Response interface that includes the 'success' method
export interface CustomResponse<T> extends Response {
  // success: (response: responseData<T>) => void;
  json: Send<responseData<T>, this>;
}
