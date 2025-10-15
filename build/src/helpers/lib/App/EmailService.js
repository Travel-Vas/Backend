"use strict";
// import nodemailer from 'nodemailer'
// import dotenv from "dotenv"
// dotenv.config()
// import * as aws from "@aws-sdk/client-ses";
// import ejs from 'ejs';
// import { EMAIL_PORT, UserRole, AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY, AWS_SES_REGION } from '../../constants';
// import path from 'path';
// import * as fs from "node:fs";
// const  { EMAIL_PASSWORD, EMAIL, EMAIL_HOST} = process.env
//
// // const transporter = nodemailer.createTransport({
// //   host: "mail.maitechstudio.net",
// //   port: 465,
// //   secure: true, // Port 465 usually requires secure connection
// //   auth: {
// //     user: "ddttest@maitechstudio.ne",
// //     pass: "ddtTester@evon",
// //   },
// //   debug: true,
// // });
// const transporter = nodemailer.createTransport({
//   host: "mail.privateemail.com",
//   port: 465, // Typically 587 for non-secure STARTTLS
//   secure: true, // Set to true for port 465
//   auth: {
//     user: EMAIL, // Your SMTP username
//     pass: EMAIL_PASSWORD, // Your SMTP password
//   },
// },
// );
//
// // transporter.set('debug', true);
// // transporter.set('logger', console);
// transporter.verify((error, success) => {
//   if (error) {
//     console.error("Error connecting to SMTP server:", error);
//   } else {
//     console.log("SMTP server is ready to take messages:", success);
//   }
// });
// // const ses = new aws.SES({
// //   apiVersion: "latest",
// //   region: AWS_SES_REGION,
// //   credentials: {
// //     secretAccessKey: AWS_SECRET_ACCESS_KEY ?? "",
// //     accessKeyId: AWS_ACCESS_KEY ?? "",
// //   },
// // });
// // const transporter = nodemailer.createTransport({
// //   SES: { ses, aws },
// // });
//
//
// interface IItemSummary {
//   name: string;
//   price: number;
//   qty: number;
//   total: number
// }
//
// const getBase64Logo = () => {
//   try {
//     // Use absolute path instead of relative path
//     const logoPath = path.resolve(__dirname, '../../../../../templates/fotolockerLogo.png')
//
//     // Verify file exists before reading
//     if (!fs.existsSync(logoPath)) {
//       console.error('Logo file not found at:', logoPath)
//       // Provide a fallback if needed or throw error
//       return ''
//     }
//
//     const logoBase64 = fs.readFileSync(logoPath, 'base64')
//     return logoBase64
//   } catch (error: any) {
//     console.error('Error reading logo file:', error.message)
//     return '' // Return empty string if logo can't be read
//   }
// }
//
// export class EmailService {
//   public async sendOTP(subject: string, recipient: string, name: string, otp: string) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'verifyOTP.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, { otp, client_name: name, base64Logo: base64Logo });
//     try {
//      const info = await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       // console.log('Full Email Details:', {
//       //   recipient: recipient,
//       //   subject: subject,
//       //   messageId: info.messageId,
//       //   accepted: info.accepted,
//       //   rejected: info.rejected,
//       //   response: info.response
//       // });
//     } catch (error:any) {
//       console.error('Detailed Email Error:', {
//         message: error.message,
//         stack: error.stack,
//         code: error.code
//       });
//       throw error;
//     }
//   }
//
//   public async welcome(subject: string, recipient: string, name: string,) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'welcome.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, { client_name: name, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async accessToken(subject: string, recipient: string, name: string, access_token:string, shoot_type: string, shoot_date: any, photo_count: number, gallery_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'access_token.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {access_token:access_token,shoot_type:shoot_type, shoot_date:shoot_date, photo_count:photo_count, gallery_url:gallery_url, client_name: name, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async clientSelectedPhotosMail(subject: string, recipient: string, name: string, selected_count:string, total_photos: string, client_name: any,shoot_type: any, shoot_date: any, gallery_id: any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'cleint_selected_photos.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {photographer_name: name,selected_count:selected_count,total_photos:total_photos, client_name:client_name,shoot_type:shoot_type, shoot_date:shoot_date,gallery_id:gallery_id,dashboard_url:dashboard_url, base64Logo: base64Logo });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async clientDownloadNotificationMail(subject: string, recipient: string, name: string,shoot_type: any,shoot_name:any, client_name: string, download_date:string, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'client_downloaded_shoot.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {photographer_name: name,shoot_type:shoot_type,shoot_name:shoot_name,client_name:client_name,download_date:download_date,dashboard_url:dashboard_url});
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async clientEditedPhotosMail(subject: string, recipient: string,client_name: any,shoot_type: any, edited_count:any, access_key:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'client_edited_phots.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {client_name:client_name,shoot_type:shoot_type,edited_count:edited_count, access_key:access_key,gallery_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async contactUsNotificationMail(subject: string, recipient: string,fullName: any, email:any, message:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'contac_us.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {fullName:fullName, email:email, message:message, gallery_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async invoiceNotificationMail(subject: string, recipient: string,recipientName: any, invoiceNumber:any, address1:any, issuedDate:any, dueDate:any, currency:any, items:any, subTotal:any,discount:any, discountAmount:any, totalAmount:any,  companyName:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'invoice.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {recipient:recipient, recipientName:recipientName, invoiceNumber:invoiceNumber, address1:address1, issuedDate:issuedDate,dueDate:dueDate, currency:currency, items:items, subTotal:subTotal,discount:discount, discountAmount:discountAmount,  totalAmount:totalAmount,companyName:companyName, gallery_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async subscriptionNotificationMail(subject: string, recipient: string,recipientName: any, plan_name:any, subscription_status:any, amount:any, billing_cycle:any, start_date:any, next_billing_date:any, benefits:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'subscription.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {recipient:recipient, customer_name:recipientName, plan_name:plan_name,subscription_status:subscription_status, amount:amount, billing_cycle:billing_cycle, start_date:start_date, next_billing_date:next_billing_date, benefits:benefits, dashboard_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async subscriptionCancellationNotificationMail(subject: string, recipient: string,recipientName: any, plan_name:any, cancellation_date:any, amount:any, billing_cycle:any, start_date:any, last_billing_date:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {recipient:recipient, customer_name:recipientName, plan_name:plan_name,cancellation_date:cancellation_date, amount:amount, billing_cycle:billing_cycle, start_date:start_date, last_billing_date:last_billing_date, dashboard_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async subscriptionExpiredNotificationMail(subject: string, recipient: string,recipientName: any, plan_name:any, cancellation_date:any, amount:any, billing_cycle:any, start_date:any, last_billing_date:any, dashboard_url: any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {recipient:recipient, customer_name:recipientName, plan_name:plan_name,cancellation_date:cancellation_date, amount:amount, billing_cycle:billing_cycle, start_date:start_date, last_billing_date:last_billing_date,dashboard_url:dashboard_url });
//
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async deposit(subject: string, recipient: string, name: string, amount: number, ref: string, tx_date: Date) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'deposit.ejs');
//     const htmlContent = await ejs.renderFile(templatePath, { client_name: name, amount, ref, tx_date: tx_date.toLocaleDateString() });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: EMAIL,
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async suspensionMail(subject: string, recipient: string, customer_name: string, suspension_reason:string, evidence_items: string) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'suspension.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {customer_name:customer_name,suspension_reason:suspension_reason, evidence_items:evidence_items, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async accountActivationMail(subject: string, recipient: string, customer_name: string, resolution_details:any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'account_activation.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {customer_name:customer_name,resolution_details:resolution_details, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async withdrawalNotificationMail(subject: string, recipient: string, customer_name: string, amount:any, currency:any, transaction_reference:any, status:any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'withdrawal.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {client_name:customer_name,amount:amount,currency:currency,transaction_reference:transaction_reference, status:status, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//   public async premiumPlanNotificationMail(subject: string, recipient: string, client_name: string, plan_name:any, activation_date:any, expiry_date:any) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'premium_plan.ejs');
//     const base64Logo = getBase64Logo()
//     const htmlContent = await ejs.renderFile(templatePath, {client_name:client_name,plan_name:plan_name,activation_date:activation_date,expiry_date:expiry_date, base64Logo: base64Logo });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: 'fotolocker <noreply@fotolocker.us>',
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
//
//   public async purchase_receipt(subject: string, recipient: string, name: string, order_id: string, items: IItemSummary[], order_total: number) {
//     const templatePath = path.join(__dirname, '../../../../../templates', 'purchase_receipt.ejs');
//     const htmlContent = await ejs.renderFile(templatePath, { client_name: name, order_id, items, order_total });
//     try {
//       await transporter.sendMail({
//         subject: subject,
//         from: EMAIL,
//         to: recipient,
//         html: htmlContent
//       })
//       console.log('email sent successfully')
//     } catch (e) {
//       //do nth
//       console.log(e, 'email error')
//     }
//   }
// }
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const brevo = __importStar(require("@getbrevo/brevo"));
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("node:fs"));
const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;
// Initialize Brevo API client
const apiInstance = new brevo.TransactionalEmailsApi();
apiInstance.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY || '');
// Verify Brevo connection
const verifyBrevoConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const accountApi = new brevo.AccountApi();
        accountApi.setApiKey(brevo.AccountApiApiKeys.apiKey, BREVO_API_KEY || '');
        const account = yield accountApi.getAccount();
        console.log('✅ Brevo connection successful:', account.email);
    }
    catch (error) {
        console.error('❌ Brevo connection failed:', error.message);
    }
});
verifyBrevoConnection();
const getBase64Logo = () => {
    try {
        const logoPath = path_1.default.resolve(__dirname, '../../../../../templates/fotolockerLogo.png');
        if (!fs.existsSync(logoPath)) {
            console.error('Logo file not found at:', logoPath);
            return '';
        }
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        return logoBase64;
    }
    catch (error) {
        console.error('Error reading logo file:', error.message);
        return '';
    }
};
class EmailService {
    /**
     * Helper method to send email via Brevo
     */
    sendBrevoEmail(subject, recipient, htmlContent, recipientName) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const sendSmtpEmail = new brevo.SendSmtpEmail();
                sendSmtpEmail.subject = subject;
                sendSmtpEmail.htmlContent = htmlContent;
                sendSmtpEmail.sender = {
                    name: BREVO_SENDER_NAME || 'fotolocker',
                    email: BREVO_SENDER_EMAIL || 'noreply@fotolocker.us',
                };
                sendSmtpEmail.to = [
                    {
                        email: recipient,
                        name: recipientName || '',
                    },
                ];
                const result = yield apiInstance.sendTransacEmail(sendSmtpEmail);
                console.log('✅ Email sent successfully:', {
                    messageId: result.messageId,
                    to: recipient,
                });
                return result;
            }
            catch (error) {
                console.error('❌ Detailed Email Error:', {
                    message: error.message,
                    response: (_a = error.response) === null || _a === void 0 ? void 0 : _a.body,
                    code: error.code,
                });
                throw error;
            }
        });
    }
    sendOTP(subject, recipient, name, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'verifyOTP.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                otp,
                client_name: name,
                base64Logo: base64Logo
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    welcome(subject, recipient, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'welcome.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: name,
                base64Logo: base64Logo
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    accessToken(subject, recipient, name, access_token, shoot_type, shoot_date, photo_count, gallery_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'access_token.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                access_token: access_token,
                shoot_type: shoot_type,
                shoot_date: shoot_date,
                photo_count: photo_count,
                gallery_url: gallery_url,
                client_name: name,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    clientSelectedPhotosMail(subject, recipient, name, selected_count, total_photos, client_name, shoot_type, shoot_date, gallery_id, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'cleint_selected_photos.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                photographer_name: name,
                selected_count: selected_count,
                total_photos: total_photos,
                client_name: client_name,
                shoot_type: shoot_type,
                shoot_date: shoot_date,
                gallery_id: gallery_id,
                dashboard_url: dashboard_url,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    clientDownloadNotificationMail(subject, recipient, name, shoot_type, shoot_name, client_name, download_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'client_downloaded_shoot.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                photographer_name: name,
                shoot_type: shoot_type,
                shoot_name: shoot_name,
                client_name: client_name,
                download_date: download_date,
                dashboard_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    clientEditedPhotosMail(subject, recipient, client_name, shoot_type, edited_count, access_key, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'client_edited_phots.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: client_name,
                shoot_type: shoot_type,
                edited_count: edited_count,
                access_key: access_key,
                gallery_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, client_name);
        });
    }
    contactUsNotificationMail(subject, recipient, fullName, email, message, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'contac_us.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                fullName: fullName,
                email: email,
                message: message,
                gallery_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, fullName);
        });
    }
    invoiceNotificationMail(subject, recipient, recipientName, invoiceNumber, address1, issuedDate, dueDate, currency, items, subTotal, discount, discountAmount, totalAmount, companyName, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'invoice.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                recipient: recipient,
                recipientName: recipientName,
                invoiceNumber: invoiceNumber,
                address1: address1,
                issuedDate: issuedDate,
                dueDate: dueDate,
                currency: currency,
                items: items,
                subTotal: subTotal,
                discount: discount,
                discountAmount: discountAmount,
                totalAmount: totalAmount,
                companyName: companyName,
                gallery_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, recipientName);
        });
    }
    subscriptionNotificationMail(subject, recipient, recipientName, plan_name, subscription_status, amount, billing_cycle, start_date, next_billing_date, benefits, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                recipient: recipient,
                customer_name: recipientName,
                plan_name: plan_name,
                subscription_status: subscription_status,
                amount: amount,
                billing_cycle: billing_cycle,
                start_date: start_date,
                next_billing_date: next_billing_date,
                benefits: benefits,
                dashboard_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, recipientName);
        });
    }
    subscriptionCancellationNotificationMail(subject, recipient, recipientName, plan_name, cancellation_date, amount, billing_cycle, start_date, last_billing_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                recipient: recipient,
                customer_name: recipientName,
                plan_name: plan_name,
                cancellation_date: cancellation_date,
                amount: amount,
                billing_cycle: billing_cycle,
                start_date: start_date,
                last_billing_date: last_billing_date,
                dashboard_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, recipientName);
        });
    }
    subscriptionExpiredNotificationMail(subject, recipient, recipientName, plan_name, cancellation_date, amount, billing_cycle, start_date, last_billing_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                recipient: recipient,
                customer_name: recipientName,
                plan_name: plan_name,
                cancellation_date: cancellation_date,
                amount: amount,
                billing_cycle: billing_cycle,
                start_date: start_date,
                last_billing_date: last_billing_date,
                dashboard_url: dashboard_url,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, recipientName);
        });
    }
    deposit(subject, recipient, name, amount, ref, tx_date) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'deposit.ejs');
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: name,
                amount,
                ref,
                tx_date: tx_date.toLocaleDateString(),
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
    suspensionMail(subject, recipient, customer_name, suspension_reason, evidence_items) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'suspension.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                customer_name: customer_name,
                suspension_reason: suspension_reason,
                evidence_items: evidence_items,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, customer_name);
        });
    }
    accountActivationMail(subject, recipient, customer_name, resolution_details) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'account_activation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                customer_name: customer_name,
                resolution_details: resolution_details,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, customer_name);
        });
    }
    withdrawalNotificationMail(subject, recipient, customer_name, amount, currency, transaction_reference, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'withdrawal.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: customer_name,
                amount: amount,
                currency: currency,
                transaction_reference: transaction_reference,
                status: status,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, customer_name);
        });
    }
    premiumPlanNotificationMail(subject, recipient, client_name, plan_name, activation_date, expiry_date) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'premium_plan.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: client_name,
                plan_name: plan_name,
                activation_date: activation_date,
                expiry_date: expiry_date,
                base64Logo: base64Logo,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, client_name);
        });
    }
    purchase_receipt(subject, recipient, name, order_id, items, order_total) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'purchase_receipt.ejs');
            const htmlContent = yield ejs_1.default.renderFile(templatePath, {
                client_name: name,
                order_id,
                items,
                order_total,
            });
            return this.sendBrevoEmail(subject, recipient, htmlContent, name);
        });
    }
}
exports.EmailService = EmailService;
