import dotenv from "dotenv";
import { CustomError } from "../lib/App";
import { ResponseMessage } from "./application.constants";

dotenv.config();
export const isDev = process.env.NODE_ENV !== "production";

const requiredEnvs = [
  "DATABASE",
  "NODE_ENV",
  "REDIS_USERNAME",
  "REDIS_PASSWORD",
  "REDIS_HOST",
  "REDIS_PORT",
  // 'EMAIL',
  // 'EMAIL_PASSWORD',
  // 'GOOGLE_CLIENT_ID',
  // 'GOOGLE_CLIENT_SECRET',
  "JWT_SECRET_KEY",
  // 'EMAIL_HOST',
  // 'ClOUDINARY_CLOUD_NAME',
  // 'ClOUDINARY_API_KEY',
  // 'ClOUDINARY_API_SECRET',
  // 'CLOUDINARY_URL',
] as const;
interface Envs {
  [key: string]: string;
}

const envs: Envs = requiredEnvs.reduce((acc: Envs, key: string) => {
  acc[key] = process.env[key] as string;
  return acc;
}, {});

const missingEnvs: string[] = requiredEnvs.filter((key) => !envs[key]);

if (missingEnvs.length > 0 || !process.env.PORT) {
  console.error("ENV Error, the following ENV variables are not set:");
  missingEnvs.push("PORT");
  console.table(missingEnvs);
  throw new CustomError({
    message: ResponseMessage.ENV_NOT_FOUND,
    code: 500,
  });
}

export const PORT: number = Number(process.env.PORT);
export const EMAIL_PORT: number = Number(process.env.EMAIL_PORT);

export const {
  DATABASE,
  NODE_ENV,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
  EMAIL,
  EMAIL_PASSWORD,
  EMAIL_HOST,
  AWS_ACCESS_KEY,
  AWS_SECRET_ACCESS_KEY,
  AWS_SES_REGION,
  JWT_SECRET_KEY
  // GOOGLE_CLIENT_ID,
  // GOOGLE_CLIENT_SECRET,
  // PG_SECRET_KEY,
  // PG_CALLBACK_URL,
  // ClOUDINARY_CLOUD_NAME,
  // ClOUDINARY_API_KEY,
  // ClOUDINARY_API_SECRET,
  // CLOUDINARY_URL,
} = envs;
