"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentMethodType = void 0;
// Add supported payment method types
var PaymentMethodType;
(function (PaymentMethodType) {
    PaymentMethodType["CARD"] = "card";
    PaymentMethodType["APPLE_PAY"] = "apple_pay";
    PaymentMethodType["GOOGLE_PAY"] = "google_pay";
    PaymentMethodType["ALIPAY"] = "alipay";
    PaymentMethodType["IDEAL"] = "ideal";
    PaymentMethodType["SEPA"] = "sepa_debit";
    PaymentMethodType["SOFORT"] = "sofort";
    PaymentMethodType["GIROPAY"] = "giropay";
    PaymentMethodType["BANCONTACT"] = "bancontact";
    PaymentMethodType["P24"] = "p24";
    PaymentMethodType["EPS"] = "eps";
    PaymentMethodType["AFTERPAY"] = "afterpay_clearpay";
    PaymentMethodType["KLARNA"] = "klarna";
    PaymentMethodType["ACH"] = "ach_debit";
    PaymentMethodType["BACS"] = "bacs_debit";
    PaymentMethodType["WECHAT"] = "wechat_pay";
})(PaymentMethodType || (exports.PaymentMethodType = PaymentMethodType = {}));
// Configuration for different payment methods
const PAYMENT_METHOD_CONFIG = {
    [PaymentMethodType.CARD]: {
        currencies: ['usd', 'ngn', 'eur', 'gbp', 'aud', 'cad'],
        countries: ['*'] // Available worldwide
    },
    [PaymentMethodType.APPLE_PAY]: {
        currencies: ['usd', 'ngn', 'eur', 'gbp'],
        countries: ['US', 'GB', 'NG', 'FR', 'DE', 'AU']
    },
    [PaymentMethodType.GOOGLE_PAY]: {
        currencies: ['usd', 'ngn', 'eur', 'gbp'],
        countries: ['US', 'NG', 'GB', 'FR', 'DE', 'AU']
    },
    [PaymentMethodType.ALIPAY]: {
        currencies: ['cny', 'usd', 'eur'],
        countries: ['CN']
    },
    [PaymentMethodType.IDEAL]: {
        currencies: ['eur'],
        countries: ['NL']
    },
    [PaymentMethodType.SEPA]: {
        currencies: ['eur'],
        countries: ['DE', 'FR', 'ES', 'IT', 'NL', 'BE']
    },
    [PaymentMethodType.SOFORT]: {
        currencies: ['eur'],
        countries: ['DE', 'AT']
    },
    [PaymentMethodType.GIROPAY]: {
        currencies: ['eur'],
        countries: ['DE']
    },
    [PaymentMethodType.BANCONTACT]: {
        currencies: ['eur'],
        countries: ['BE']
    },
    [PaymentMethodType.P24]: {
        currencies: ['eur', 'pln'],
        countries: ['PL']
    },
    [PaymentMethodType.EPS]: {
        currencies: ['eur'],
        countries: ['AT']
    },
    [PaymentMethodType.AFTERPAY]: {
        currencies: ['usd', 'gbp', 'aud', 'nzd'],
        countries: ['US', 'GB', 'AU', 'NZ'],
        minimum_amount: 1000,
        maximum_amount: 200000
    },
    [PaymentMethodType.KLARNA]: {
        currencies: ['usd', 'eur', 'gbp'],
        countries: ['US', 'DE', 'GB', 'SE', 'NO', 'FI', 'DK'],
        minimum_amount: 1000
    },
    [PaymentMethodType.ACH]: {
        currencies: ['usd'],
        countries: ['US']
    },
    [PaymentMethodType.BACS]: {
        currencies: ['gbp'],
        countries: ['GB']
    },
    [PaymentMethodType.WECHAT]: {
        currencies: ['cny', 'usd', 'eur'],
        countries: ['CN']
    }
};
function getAvailablePaymentMethods(amount, currency, country) {
    // Add validation to handle undefined parameters
    if (!currency || !country) {
        return [PaymentMethodType.CARD]; // Default to card payment if currency or country is undefined
    }
    const amountCents = Math.round(amount * 100);
    const normalizedCurrency = currency.toLowerCase();
    const normalizedCountry = country.toUpperCase();
    return Object.entries(PAYMENT_METHOD_CONFIG)
        .filter(([_, config]) => {
        // Check currency support
        if (!config.currencies.includes(normalizedCurrency) &&
            !config.currencies.includes('*')) {
            return false;
        }
        // Check country support
        if (!config.countries.includes(normalizedCountry) &&
            !config.countries.includes('*')) {
            return false;
        }
        // Check amount limits
        if (config.minimum_amount && amountCents < config.minimum_amount) {
            return false;
        }
        if (config.maximum_amount && amountCents > config.maximum_amount) {
            return false;
        }
        return true;
    })
        .map(([method]) => method);
}
exports.default = getAvailablePaymentMethods;
