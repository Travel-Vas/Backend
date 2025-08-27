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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrenciesController = exports.CurrencyController = exports.AllInvoicesController = exports.DeleteInvoiceController = exports.UserInvoiceController = exports.SingleInvoiceController = exports.InvoiceController = void 0;
const http_status_codes_1 = require("http-status-codes");
const invoice_service_1 = require("./invoice.service");
const App_1 = require("../../helpers/lib/App");
const InvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req['user']._id,
        recipientName: req.body.recipientName,
        recipientEmail: req.body.recipientEmail,
        issuedDate: req.body.issuedDate || Date.now(),
        DueDate: req.body.dueDate && new Date(req.body.dueDate),
        currency: req.body.currency,
        Discount: req.body.discount, // Make sure this follows the format: { type: 'percent' | 'flat', value: number }
        items: req.body.items,
        totalAmount: req.body.totalAmount,
        terms: req.body.terms
    };
    const response = yield (0, invoice_service_1.InvoiceService)(payload);
    res.json({
        msg: "Invoice created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.InvoiceController = InvoiceController;
const SingleInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.params.invoiceId;
    if (!invoiceId) {
        throw new App_1.CustomError({
            message: "Invoice id not found",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, invoice_service_1.SingleInvoiceService)(invoiceId);
    res.json({
        msg: "Invoice retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.SingleInvoiceController = SingleInvoiceController;
const UserInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, invoice_service_1.UserInvoiceService)(userId);
    res.json({
        msg: "Invoices created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.UserInvoiceController = UserInvoiceController;
const DeleteInvoiceController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const invoiceId = req.params.invoiceId;
    if (!invoiceId) {
        throw new App_1.CustomError({
            message: "Invoice id not found",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, invoice_service_1.DeleteInvoiceService)(invoiceId);
    res.json({
        msg: "Invoice deleted successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.DeleteInvoiceController = DeleteInvoiceController;
const AllInvoicesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, invoice_service_1.AllInvoicesService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.AllInvoicesController = AllInvoicesController;
const CurrencyController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        name: req.body.name,
        code: req.body.code,
        symbol: req.body.symbol,
        country: req.body.country,
        exchangeRate: req.body.exchangeRate,
        isActive: req.body.isActive
    };
    if (!payload.name || !payload.code) {
        throw new App_1.CustomError({
            message: "Fields are required",
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const response = yield (0, invoice_service_1.CurrencyService)(payload);
    res.json({
        msg: "Currency created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports.CurrencyController = CurrencyController;
const CurrenciesController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, invoice_service_1.CurrenciesService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.CurrenciesController = CurrenciesController;
