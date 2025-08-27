"use strict";
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
exports.CurrenciesService = exports.CurrencyService = exports.AllInvoicesService = exports.DeleteInvoiceService = exports.UserInvoiceService = exports.SingleInvoiceService = exports.InvoiceService = void 0;
const invoice_model_1 = __importDefault(require("./invoice.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const currency_model_1 = require("./currency.model");
const user_model_1 = __importDefault(require("../users/user.model"));
const subscription_model_1 = __importDefault(require("../subscription/subscription.model"));
const InvoiceService = (ArgsDto) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // check for restrictions based on current plan
    const user_plan = yield subscription_model_1.default.findOne({
        userId: ArgsDto.userId
    }).populate("pricingId").lean().exec();
    const currentplan = (_a = user_plan === null || user_plan === void 0 ? void 0 : user_plan.pricingId) === null || _a === void 0 ? void 0 : _a.plan;
    const totalInvoice = yield invoice_model_1.default.countDocuments({
        userId: ArgsDto.userId,
    });
    if (currentplan === "Free" && totalInvoice >= 5) {
        throw new App_1.CustomError({
            message: "Upgrade your plan to create more invoice",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    } // check for the total price if it aligns
    let subTotal = 0, finalTotal, discountValue;
    for (const item of ArgsDto.items) {
        subTotal += item.totalAmount;
    }
    const userDetails = yield user_model_1.default.findOne({
        _id: ArgsDto.userId,
    }).lean().exec();
    if (ArgsDto.Discount) {
        discountValue = (Number(ArgsDto.Discount) / 100) * subTotal;
        finalTotal = subTotal - discountValue;
    }
    if (Number(subTotal) !== Number(ArgsDto.totalAmount)) {
        throw new App_1.CustomError({
            message: `Total item amount (${subTotal}) exceeds the invoice total (${ArgsDto.totalAmount}).`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const newPay = Object.assign(Object.assign({}, ArgsDto), { subTotal: subTotal, totalAmount: finalTotal ? finalTotal : subTotal });
    const response = yield invoice_model_1.default.create(newPay);
    const currency = yield currency_model_1.CurrencyModel.findOne({
        _id: response.currency,
    });
    // send invoice to user
    const gallery_url = "https://www.fotolocker.io/client-sign-in";
    yield new App_1.EmailService().invoiceNotificationMail("New invoice notification", ArgsDto.recipientEmail, ArgsDto.recipientName, response === null || response === void 0 ? void 0 : response._id, `${userDetails === null || userDetails === void 0 ? void 0 : userDetails.country} ${userDetails === null || userDetails === void 0 ? void 0 : userDetails.city}`, response === null || response === void 0 ? void 0 : response.issuedDate, response === null || response === void 0 ? void 0 : response.DueDate, currency === null || currency === void 0 ? void 0 : currency.code, response === null || response === void 0 ? void 0 : response.items, response === null || response === void 0 ? void 0 : response.subTotal, response === null || response === void 0 ? void 0 : response.Discount, discountValue, response === null || response === void 0 ? void 0 : response.totalAmount, userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name, gallery_url);
    return response;
});
exports.InvoiceService = InvoiceService;
const SingleInvoiceService = (invoiceId) => __awaiter(void 0, void 0, void 0, function* () {
    const isValid = mongoose_1.default.Types.ObjectId.isValid(invoiceId);
    if (!isValid) {
        throw new App_1.CustomError({
            message: `Invalid invoice ID (${invoiceId})`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield invoice_model_1.default.findById(invoiceId).populate("currency");
    return response;
});
exports.SingleInvoiceService = SingleInvoiceService;
const UserInvoiceService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield invoice_model_1.default.find({
        userId: userId
    }).populate("currency").lean().exec();
    return response;
});
exports.UserInvoiceService = UserInvoiceService;
const DeleteInvoiceService = (invoiceId) => __awaiter(void 0, void 0, void 0, function* () {
    const isValid = mongoose_1.default.Types.ObjectId.isValid(invoiceId);
    if (!isValid) {
        throw new App_1.CustomError({
            message: `Invalid invoice ID (${invoiceId})`,
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield invoice_model_1.default.findByIdAndDelete(invoiceId);
    return response;
});
exports.DeleteInvoiceService = DeleteInvoiceService;
const AllInvoicesService = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield invoice_model_1.default.find();
    return response;
});
exports.AllInvoicesService = AllInvoicesService;
const CurrencyService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const exist = yield currency_model_1.CurrencyModel.findOne({
        name: payload.name
    }).lean().exec();
    if (exist) {
        throw new App_1.CustomError({
            message: "Currency exist already",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield currency_model_1.CurrencyModel.create(payload);
    return response;
});
exports.CurrencyService = CurrencyService;
const CurrenciesService = (page) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield currency_model_1.CurrencyModel.find().lean().exec();
    return response;
});
exports.CurrenciesService = CurrenciesService;
