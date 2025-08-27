import dotenv from "dotenv";
import Paystack from "paystack";

dotenv.config();

const secretKey = process.env.PAYSTACK_SECRET_KEY;
if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is not defined in environment variables.");
}

export const paystack = Paystack(secretKey);
