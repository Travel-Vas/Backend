"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BillingSchema = void 0;
const yup_1 = require("yup");
exports.BillingSchema = (0, yup_1.object)({
    country: (0, yup_1.string)().required('Country is required'),
    sortCode: (0, yup_1.string)()
        .length(6, 'Sort code must be exactly 6 characters')
        .matches(/^\d{6}$/, 'Sort code must be numeric and 6 digits'),
    bankName: (0, yup_1.string)()
        .min(3, 'Bank name must be at least 3 characters')
        .required('Bank name is required'),
    accountNumber: (0, yup_1.string)()
        .length(10, 'Account number must be exactly 10 digits')
        .matches(/^\d{10}$/, 'Account number must be numeric and 10 digits')
        .required('Account number is required'),
});
