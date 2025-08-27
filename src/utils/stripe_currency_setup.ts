// Add supported payment method types
export enum PaymentMethodType {
    CARD = 'card',
    APPLE_PAY = 'apple_pay',
    GOOGLE_PAY = 'google_pay',
    ALIPAY = 'alipay',
    IDEAL = 'ideal',
    SEPA = 'sepa_debit',
    SOFORT = 'sofort',
    GIROPAY = 'giropay',
    BANCONTACT = 'bancontact',
    P24 = 'p24',
    EPS = 'eps',
    AFTERPAY = 'afterpay_clearpay',
    KLARNA = 'klarna',
    ACH = 'ach_debit',
    BACS = 'bacs_debit',
    WECHAT = 'wechat_pay'
}

interface PaymentMethodConfig {
    currencies: string[];
    countries: string[];
    minimum_amount?: number;
    maximum_amount?: number;
}

// Configuration for different payment methods
const PAYMENT_METHOD_CONFIG: Record<PaymentMethodType, PaymentMethodConfig> = {
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

function getAvailablePaymentMethods(
    amount: number,
    currency: string | undefined,
    country: string | undefined
): PaymentMethodType[] {
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
        .map(([method]) => method as PaymentMethodType);
}

export default getAvailablePaymentMethods;