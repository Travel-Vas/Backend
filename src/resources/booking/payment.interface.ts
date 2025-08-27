export interface IPaymentInitialize {
    amount: number;
    reference: string;
    name: string;
    email: string;
    callback_url?: string;
    metadata?: any;
    currency?: string;
    channels?: string[];
    plan?: string;
    invoice_limit?: number;
    split_code?: string;
    [key: string]: any;
}

export interface IPaymentResponse {
    status: boolean;
    message: string;
    data: {
        authorization_url: string;
        access_code: string;
        reference: string;
    };
}

export interface IPaymentVerification {
    status: boolean;
    message: string;
    data: {
        id: number;
        domain: string;
        status: string;
        reference: string;
        amount: number;
        message: string;
        gateway_response: string;
        paid_at: string;
        created_at: string;
        channel: string;
        currency: string;
        ip_address: string;
        metadata: any;
        log: any;
        fees: number;
        fees_split: any;
        authorization: any;
        customer: any;
        plan: any;
        split: any;
        order_id: any;
        paidAt: string;
        createdAt: string;
        requested_amount: number;
        pos_transaction_data: any;
        source: any;
        fees_breakdown: any;
        transaction_date: string;
        plan_object: any;
        subaccount: any;
    };
}

export interface IInstallmentPayment {
    tripId: string;
    userId: string;
    totalAmount: number;
    installmentCount: number;
    installmentAmount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    email: string;
}

export enum PaymentStatus {
    PENDING = 'pending',
    SUCCESS = 'success',
    FAILED = 'failed',
    ABANDONED = 'abandoned'
}

export enum PaymentType {
    FULL = 'full',
    INSTALLMENT = 'installment'
}