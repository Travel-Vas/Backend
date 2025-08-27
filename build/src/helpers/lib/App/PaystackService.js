"use strict";
// import axios from 'axios';
// import { PG_CALLBACK_URL, PG_SECRET_KEY } from '../../constants';
// import { CustomError } from './customError';
// const metadata = {
//    "cancel_action": "https://github.com/Sally-Builds",
//    payment_type: 'transfer',
// }
// export interface IPGGenerateLink {
//    url: string | null,
//    reference: string | null,
// }
// const paystackInstance = axios.create({
//    baseURL: 'https://api.paystack.co',
//    headers: {
//       Authorization: `Bearer ${PG_SECRET_KEY}`
//    }
// })
// export default class PaystackService {
//    public static async generatePaymentLink(email: string, amount: number, metadata: any): Promise<IPGGenerateLink> {
//       const metadataPayload = {
//          "cancel_action": "https://github.com/Sally-Builds",
//          ...metadata
//       }
//       try {
//          const res = await paystackInstance.post('/transaction/initialize', { email, amount, metadata: metadataPayload, callback_url: PG_CALLBACK_URL })
//          return {
//             url: res.data.data.authorization_url,
//             reference: res.data.data.reference,
//          }
//       } catch (e) {
//          console.log(e)
//          return {
//             url: null,
//             reference: null,
//          }
//       }
//    }
//    public static async verifyPayment(reference: string): Promise<any> {
//       try {
//          const res = await paystackInstance.get(`/transaction/verify/${reference}`)
//          return res.data.data
//       } catch (e) {
//          console.log(e)
//          throw new CustomError({ message: "Transcation cannot be verified at this moment", code: 400 })
//       }
//    }
//    public static async getBanks(): Promise<any[]> {
//       try {
//          const res = await paystackInstance.get("/bank?currency=NGN")
//          return res.data.data
//       } catch (e) {
//          console.log(e)
//          throw new CustomError({ message: "Error Fetching Banks", code: 500 })
//       }
//    }
//    public static async resolveAccount(account_no: string, bank_code: string): Promise<any | null> {
//       try {
//          const res = await paystackInstance.get(`/bank/resolve?account_number=${account_no}&bank_code=${bank_code}`)
//          return res.data.data
//       } catch (e) {
//          return null
//       }
//    }
//    public static async createTransferRecipient(name: string, account_number: string, bank_code: string): Promise<any | null> {
//       try {
//          const data = { account_number, bank_code, name, currency: "NGN", type: "nuban" }
//          const res = await paystackInstance.post(`/transferrecipient`, data)
//          return { recipient_code: res.data.data.recipient_code, name: res.data.data.name, account_number: res.data.data.details.account_number }
//       } catch (e: any) {
//          console.log(e.response)
//          return null
//       }
//    }
//    public static async getPaystackBalance(): Promise<number> {
//       try {
//          const res = await paystackInstance.get(`/balance`)
//          console.log(res.data.data, 'balance')
//          return res.data.data[0].balance
//       } catch (e) {
//          console.log(e)
//          throw new CustomError({ message: "Error Fetching Paystack Balance", code: 500 })
//       }
//    }
//    public static async makeTransfer(recipient_code: string, amount: number, ref: string) {
//       const data = {
//          recipient_code,
//          amount,
//          ref,
//          reason: "Gookway Withdrawal"
//       }
//       try {
//          if (amount >= await this.getPaystackBalance()) throw new CustomError({ message: "Insufficient Funds", code: 400 })
//          const res = await paystackInstance.post('/transfer', data)
//          console.log(res.data, 'transfer')
//          return res
//       } catch (e) {
//          console.log(e)
//       }
//    }
// }
