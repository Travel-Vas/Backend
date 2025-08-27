"use strict";
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
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ejs_1 = __importDefault(require("ejs"));
const path_1 = __importDefault(require("path"));
const fs = __importStar(require("node:fs"));
const { EMAIL_PASSWORD, EMAIL, EMAIL_HOST } = process.env;
// const transporter = nodemailer.createTransport({
//   host: "mail.maitechstudio.net",
//   port: 465,
//   secure: true, // Port 465 usually requires secure connection
//   auth: {
//     user: "ddttest@maitechstudio.ne",
//     pass: "ddtTester@evon",
//   },
//   debug: true,
// });
const transporter = nodemailer_1.default.createTransport({
    host: "mail.privateemail.com",
    port: 465, // Typically 587 for non-secure STARTTLS
    secure: true, // Set to true for port 465
    auth: {
        user: EMAIL, // Your SMTP username
        pass: EMAIL_PASSWORD, // Your SMTP password
    },
});
// transporter.set('debug', true);
// transporter.set('logger', console);
transporter.verify((error, success) => {
    if (error) {
        console.error("Error connecting to SMTP server:", error);
    }
    else {
        console.log("SMTP server is ready to take messages:", success);
    }
});
const getBase64Logo = () => {
    try {
        // Use absolute path instead of relative path
        const logoPath = path_1.default.resolve(__dirname, '../../../../../templates/fotolockerLogo.png');
        // Verify file exists before reading
        if (!fs.existsSync(logoPath)) {
            console.error('Logo file not found at:', logoPath);
            // Provide a fallback if needed or throw error
            return '';
        }
        const logoBase64 = fs.readFileSync(logoPath, 'base64');
        return logoBase64;
    }
    catch (error) {
        console.error('Error reading logo file:', error.message);
        return ''; // Return empty string if logo can't be read
    }
};
class EmailService {
    sendOTP(subject, recipient, name, otp) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'verifyOTP.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { otp, client_name: name, base64Logo: base64Logo });
            try {
                const info = yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                // console.log('Full Email Details:', {
                //   recipient: recipient,
                //   subject: subject,
                //   messageId: info.messageId,
                //   accepted: info.accepted,
                //   rejected: info.rejected,
                //   response: info.response
                // });
            }
            catch (error) {
                console.error('Detailed Email Error:', {
                    message: error.message,
                    stack: error.stack,
                    code: error.code
                });
                throw error;
            }
        });
    }
    welcome(subject, recipient, name) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'welcome.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: name, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    accessToken(subject, recipient, name, access_token, shoot_type, shoot_date, photo_count, gallery_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'access_token.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { access_token: access_token, shoot_type: shoot_type, shoot_date: shoot_date, photo_count: photo_count, gallery_url: gallery_url, client_name: name, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    clientSelectedPhotosMail(subject, recipient, name, selected_count, total_photos, client_name, shoot_type, shoot_date, gallery_id, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'cleint_selected_photos.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { photographer_name: name, selected_count: selected_count, total_photos: total_photos, client_name: client_name, shoot_type: shoot_type, shoot_date: shoot_date, gallery_id: gallery_id, dashboard_url: dashboard_url, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    clientDownloadNotificationMail(subject, recipient, name, shoot_type, shoot_name, client_name, download_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'client_downloaded_shoot.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { photographer_name: name, shoot_type: shoot_type, shoot_name: shoot_name, client_name: client_name, download_date: download_date, dashboard_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    clientEditedPhotosMail(subject, recipient, client_name, shoot_type, edited_count, access_key, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'client_edited_phots.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: client_name, shoot_type: shoot_type, edited_count: edited_count, access_key: access_key, gallery_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    contactUsNotificationMail(subject, recipient, fullName, email, message, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'contac_us.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { fullName: fullName, email: email, message: message, gallery_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    invoiceNotificationMail(subject, recipient, recipientName, invoiceNumber, address1, issuedDate, dueDate, currency, items, subTotal, discount, discountAmount, totalAmount, companyName, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'invoice.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { recipient: recipient, recipientName: recipientName, invoiceNumber: invoiceNumber, address1: address1, issuedDate: issuedDate, dueDate: dueDate, currency: currency, items: items, subTotal: subTotal, discount: discount, discountAmount: discountAmount, totalAmount: totalAmount, companyName: companyName, gallery_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    subscriptionNotificationMail(subject, recipient, recipientName, plan_name, subscription_status, amount, billing_cycle, start_date, next_billing_date, benefits, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { recipient: recipient, customer_name: recipientName, plan_name: plan_name, subscription_status: subscription_status, amount: amount, billing_cycle: billing_cycle, start_date: start_date, next_billing_date: next_billing_date, benefits: benefits, dashboard_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    subscriptionCancellationNotificationMail(subject, recipient, recipientName, plan_name, cancellation_date, amount, billing_cycle, start_date, last_billing_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { recipient: recipient, customer_name: recipientName, plan_name: plan_name, cancellation_date: cancellation_date, amount: amount, billing_cycle: billing_cycle, start_date: start_date, last_billing_date: last_billing_date, dashboard_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    subscriptionExpiredNotificationMail(subject, recipient, recipientName, plan_name, cancellation_date, amount, billing_cycle, start_date, last_billing_date, dashboard_url) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'subscription_cancellation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { recipient: recipient, customer_name: recipientName, plan_name: plan_name, cancellation_date: cancellation_date, amount: amount, billing_cycle: billing_cycle, start_date: start_date, last_billing_date: last_billing_date, dashboard_url: dashboard_url });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    deposit(subject, recipient, name, amount, ref, tx_date) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'deposit.ejs');
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: name, amount, ref, tx_date: tx_date.toLocaleDateString() });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: EMAIL,
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    suspensionMail(subject, recipient, customer_name, suspension_reason, evidence_items) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'suspension.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { customer_name: customer_name, suspension_reason: suspension_reason, evidence_items: evidence_items, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    accountActivationMail(subject, recipient, customer_name, resolution_details) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'account_activation.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { customer_name: customer_name, resolution_details: resolution_details, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    withdrawalNotificationMail(subject, recipient, customer_name, amount, currency, transaction_reference, status) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'withdrawal.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: customer_name, amount: amount, currency: currency, transaction_reference: transaction_reference, status: status, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    premiumPlanNotificationMail(subject, recipient, client_name, plan_name, activation_date, expiry_date) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'premium_plan.ejs');
            const base64Logo = getBase64Logo();
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: client_name, plan_name: plan_name, activation_date: activation_date, expiry_date: expiry_date, base64Logo: base64Logo });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: 'fotolocker <noreply@fotolocker.us>',
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
    purchase_receipt(subject, recipient, name, order_id, items, order_total) {
        return __awaiter(this, void 0, void 0, function* () {
            const templatePath = path_1.default.join(__dirname, '../../../../../templates', 'purchase_receipt.ejs');
            const htmlContent = yield ejs_1.default.renderFile(templatePath, { client_name: name, order_id, items, order_total });
            try {
                yield transporter.sendMail({
                    subject: subject,
                    from: EMAIL,
                    to: recipient,
                    html: htmlContent
                });
                console.log('email sent successfully');
            }
            catch (e) {
                //do nth
                console.log(e, 'email error');
            }
        });
    }
}
exports.EmailService = EmailService;
