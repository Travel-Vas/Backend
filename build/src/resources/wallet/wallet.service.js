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
exports.verifyOtpAndResetPinService = exports.resetPinService = exports.listBanksService = exports.adminApproveWithdrawalService = exports.initWithdrawalService = exports.withdrawWalletService = exports.autoWithdrawWalletService = exports.allCurrencies = exports.getExchangeRate = exports.createPinService = exports.depositToWalletService = exports.updateWalletStatusService = exports.getUsersWalletService = exports.createWalletService = void 0;
exports.allWithdrawalsService = allWithdrawalsService;
exports.singleWithdrawalsService = singleWithdrawalsService;
const App_1 = require("../../helpers/lib/App");
const wallet_model_1 = require("./wallet.model");
const http_status_codes_1 = require("http-status-codes");
const app_1 = require("../../app");
const reference_1 = __importDefault(require("../../utils/reference"));
const transaction_model_1 = require("../transactions/transaction.model");
const stripe_1 = __importDefault(require("../../utils/stripe"));
const transaction_interface_1 = require("../transactions/transaction.interface");
// import ClientsModel from "../clients/clients.model";
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const billing_model_1 = require("../payment/billing.model");
const user_model_1 = __importDefault(require("../users/user.model"));
const countries = __importStar(require("i18n-iso-countries"));
const enLocale = __importStar(require("i18n-iso-countries/langs/en.json"));
// import PortfolioModel from "../portfolio_website/portfolio.model";
const axios_1 = __importDefault(require("axios"));
const constants_1 = require("../../helpers/constants");
const mongoose_1 = __importDefault(require("mongoose"));
const otp_generator_1 = __importDefault(require("otp-generator"));
const createWalletService = (argsDto) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield wallet_model_1.WalletModel.findOne({
            userId: argsDto.userId,
        }).lean().exec();
        if (isExist) {
            return;
        }
        const newWallet = yield wallet_model_1.WalletModel.create(argsDto);
        return newWallet;
    }
    catch (err) {
        throw new App_1.CustomError({
            message: err.message,
            code: err.code,
        });
    }
});
exports.createWalletService = createWalletService;
const getUsersWalletService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure userId is an ObjectId if your schema uses ObjectId for userId
        // This is crucial if `userId` in your `TransactionModel` is of type `mongoose.Schema.Types.ObjectId`
        const objectIdUserId = new mongoose_1.default.Types.ObjectId(userId);
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: objectIdUserId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: `Wallet not found for user`,
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        // Fetch all relevant completed transactions for the user
        const completedTransactions = yield transaction_model_1.TransactionModel.find({
            userId: objectIdUserId,
            txnStatus: transaction_interface_1.TxnStatus.COMPLETED,
        });
        let totalEarnings = 0;
        let totalWithdrawals = 0;
        completedTransactions.forEach((transaction) => {
            // Convert amount from string to number. Use parseFloat or Number().
            // Be mindful of potential non-numeric strings in the 'amount' field.
            const amount = parseFloat(transaction.amount);
            if (isNaN(amount)) {
                console.warn(`Transaction ID ${transaction._id} has a non-numeric amount: ${transaction.amount}`);
                return; // Skip this transaction or handle error as appropriate
            }
            if (transaction.transactionType === "deposit") {
                totalEarnings += amount;
            }
            else if (transaction.transactionType === "withdrawal") {
                totalWithdrawals += amount;
            }
        });
        console.log("Total Earnings:", totalEarnings);
        console.log("Total Withdrawals:", totalWithdrawals);
        const responseDto = {
            wallet: wallet,
            pinCreated: (wallet === null || wallet === void 0 ? void 0 : wallet.walletPin) !== "",
            totalEarnings: totalEarnings,
            totalWithdrawals: totalWithdrawals
        };
        return responseDto;
    }
    catch (err) {
        // It's good practice to log the actual error for debugging
        console.error("Error in getUsersWalletService:", err);
        throw new App_1.CustomError({
            message: err.message || 'Failed to retrieve wallet',
            code: err.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR // Provide a default status code
        });
    }
});
exports.getUsersWalletService = getUsersWalletService;
const updateWalletStatusService = (userId, status) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const walletExist = yield wallet_model_1.WalletModel.findOne({
            userId: userId
        }).lean().exec();
        if (!walletExist) {
            throw new App_1.CustomError({
                message: `Wallet not found for user`,
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        yield wallet_model_1.WalletModel.findByIdAndUpdate({
            userId: userId,
        }, {
            status: status
        }, {
            new: true
        }).lean().exec();
        return true;
    }
    catch (err) {
        throw new App_1.CustomError({
            message: err.message || 'Failed to update wallet',
            code: err.code,
        });
    }
});
exports.updateWalletStatusService = updateWalletStatusService;
const depositToWalletService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = yield app_1.redis_client.getRedisClient();
    try {
        const reference = (0, reference_1.default)(payload.userId);
        const wallet = yield wallet_model_1.WalletModel.findOne({
            walletNumber: payload.walletNo,
            status: 'active'
        }).lean().exec();
        if (!wallet) {
            throw new App_1.CustomError({
                message: `Wallet not found for user or is not active`,
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (payload.clientId) {
            const clientExist = yield ClientsModel.findOne({
                _id: payload.clientId,
            }).lean().exec();
            if (!clientExist) {
                throw new App_1.CustomError({
                    message: 'Invalid client provided',
                    code: http_status_codes_1.StatusCodes.NOT_FOUND
                });
            }
        }
        const existingTransaction = yield transaction_model_1.TransactionModel.findOne({
            txnReference: reference,
        }).lean().exec();
        if (existingTransaction) {
            throw new App_1.CustomError({
                message: 'Duplicate transaction reference',
                code: http_status_codes_1.StatusCodes.CONFLICT
            });
        }
        const transaction = yield transaction_model_1.TransactionModel.create([{
                walletId: wallet._id,
                clientId: payload.clientId,
                userId: wallet.userId,
                transactionType: 'deposit',
                amount: payload.amount,
                currency: wallet.currency,
                txnReference: reference,
                status: 'pending',
                reason: `Wallet Transfer In`,
            }]);
        const paymentIntent = yield stripe_1.default.paymentIntents.create({
            amount: Math.round(payload.amount * 100), // Stripe uses cents
            currency: wallet.currency.toLowerCase(),
            metadata: {
                walletId: wallet._id.toString(),
                transactionId: transaction[0]._id.toString(),
                reference: reference
            },
            payment_method_types: ["card"],
            description: `Wallet deposit for ${wallet.walletNumber}`,
            receipt_email: payload.email,
            statement_descriptor_suffix: 'WALLET DEPOSIT'
        });
        yield transaction_model_1.TransactionModel.findByIdAndUpdate((_a = transaction[0]) === null || _a === void 0 ? void 0 : _a._id, {
            stripeSetupIntentId: paymentIntent === null || paymentIntent === void 0 ? void 0 : paymentIntent.id,
            txnStatus: transaction_interface_1.TxnStatus.PROCESSING
        });
        // Commit the transaction
        yield client.del(`wallet:${wallet.userId}`);
        return {
            transaction: transaction[0],
            wallet: {
                id: wallet._id,
                balance: wallet.balance,
                currency: wallet.currency
            },
            stripePaymentIntent: {
                id: paymentIntent.id,
                clientSecret: paymentIntent.client_secret
            }
        };
    }
    catch (error) {
        // Abort transaction on error
        if (error instanceof App_1.CustomError)
            throw error;
        console.error('Deposit error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to process deposit',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.depositToWalletService = depositToWalletService;
// export const withdrawWalletService = async (payload: any) => {
//     const reference = generateTransactionReference(payload.userId)
//     const client = await redis_client.getRedisClient();
//     try {
//         if (!payload.amount || payload.amount <= 0) {
//             throw new CustomError({
//                 message: 'Invalid withdrawal amount',
//                 code: StatusCodes.BAD_REQUEST,
//             });
//         }
//         const wallet:any = await WalletModel.findOne(
//             { userId: payload.userId, status: 'active' }
//         );
//         const userDetails:any = await UserModel.findOne({
//             userId: payload.userId
//         })
//         const billingDetails:any = await BillingModel.findOne({
//             user_id: payload.userId
//         }).lean().exec()
//
//         if (!wallet) {
//             throw new CustomError({
//                 message: 'Wallet not found or is not active',
//                 code: StatusCodes.NOT_FOUND
//             });
//         }
//
//         // Pin Validity
//         const verifyPin = await bcrypt.compare(payload.pin, wallet.walletPin)
//         if(!verifyPin){
//             throw new CustomError({
//                 message: "Invalid transaction pin",
//                 code: StatusCodes.UNAUTHORIZED
//             })
//         }
//         // check for stripe balance
//         const stripe_balance: any = await stripe.balance.retrieve()
//         const main_stripe_balance = stripe_balance?.available[0]
//         // balance validation here
//         // check for customer if exist
//         let customerAccount:any = await WalletModel.findOne({
//             userId: payload.userId
//         });
//
//         if (!customerAccount?.stripeAccountId) {
//             // create connected customer Account
//             const account = await stripe.accounts.create({
//                 type: 'custom',
//                 country: userDetails?.country || 'US',
//                 email: userDetails?.email,
//                 capabilities: {
//                     transfers: { requested: true },
//                     card_payments: { requested: true },
//                 },
//                 business_type: 'individual',
//                 individual: {
//                     first_name: userDetails?.business_name,
//                     last_name: userDetails?.business_name,
//                     email: userDetails?.email,
//                 },
//                 tos_acceptance: {
//                     date: Math.floor(Date.now() / 1000),
//                     ip: payload.ip
//                 }
//             });
//
//             customerAccount = await WalletModel.findOneAndUpdate({
//                 userId: payload.userId,
//             }, {
//                 stripeAccountId: account.id,
//             }, {new: true})
//         }
//
//         if (!billingDetails) {
//             throw new CustomError({
//                 message: 'Billing details not found',
//                 code: StatusCodes.BAD_REQUEST
//             })
//         }
//         // this is to validate nigeria account on stripe
//         // const account = await stripe.accounts.retrieve(customerAccount.stripeAccountId);
//         // if (account.country !== 'NG') {
//         //     const nigerianAccount = await stripe.accounts.create({
//         //         type: 'custom',
//         //         country: 'NG',
//         //         email: 'info@fotolocker.io',
//         //         capabilities: {
//         //             transfers: {requested: true},
//         //             card_payments: {requested: true},
//         //             tax_reporting_us_1099_k: {requested: false}, // Not applicable for Nigeria
//         //             bank_transfer_payments: {requested: true},
//         //             card_issuing: {requested: true},
//         //             treasury: {requested: true},
//         //         },
//         //         business_type: 'company',
//         //         // business_profile: {
//         //         //     mcc: '5734', // Merchant Category Code - example for computer software stores
//         //         //     url: 'https://example.com',
//         //         // },
//         //         tos_acceptance: {
//         //             date: Math.floor(Date.now() / 1000),
//         //             ip: payload.ip, // Replace with actual IP address
//         //         },
//         //         // external_account: {
//         //         //     object: 'bank_account',
//         //         //     country: 'NG',
//         //         //     currency: 'ngn',
//         //         //     account_number: '0123456789', // Replace with actual account number
//         //         //     routing_number: '057', // Replace with actual bank code
//         //         // },
//         //     });
//         // } else {
//         //     console.log('Account is correctly set up for Nigeria');
//         //     // Proceed with adding the external account
//         // }
//         // return
//         // Check for existing bank accounts
//         const existingAccounts = await stripe.accounts.listExternalAccounts(
//             customerAccount.stripeAccountId,
//             { object: 'bank_account', limit: 10 }
//         );
//
//         const existingAccount = existingAccounts.data.find((acc:any) =>
//             acc.account_number === billingDetails.account_number &&
//             acc.bank_name === billingDetails.bank_name
//         );
//
//         let bankAccount: any;
//
//         if (!existingAccount) {
//             const bankCode = billingDetails.bank_code || '057';
//             const formattedBankCode = bankCode.padStart(3, '0').substring(0, 3);
//             let branchCode = '00';
//             // if (billingDetails.sort_code && billingDetails.sort_code.length >= 5) {
//             //     branchCode = billingDetails.sort_code.substring(3, 5);
//             // }
//
//             const routingNumber = `${formattedBankCode}NG${branchCode}`;
//
//             console.log('Creating external account with routing number:', routingNumber);
//
//             try {
//                 // Method 1: Using direct bank account creation
//                 bankAccount = await stripe.accounts.createExternalAccount(
//                     customerAccount.stripeAccountId,
//                     {
//                         external_account: {
//                             object: 'bank_account',
//                             country: 'NG',
//                             currency: 'ngn',
//                             account_number: "2116812823",
//                             routing_number: "057NG001",
//                             account_holder_name: "Abraham Jude",
//                             account_holder_type: 'individual'
//                         }
//                     }
//                 );
//             } catch (bankError: any) {
//                 console.error('Bank account creation error:', bankError);
//
//                 // Method 2: Alternative approach using bank tokens
//                 try {
//                     // Create a bank account token first
//                     const extendedRoutingNumber = `${formattedBankCode}NG${branchCode}123`;
//                     const bankToken = await stripe.tokens.create({
//                         bank_account: {
//                             country: 'NG',
//                             currency: 'ngn',
//                             account_number: billingDetails.account_number || billingDetails?.accountNumber,
//                             routing_number: "057NG001",
//                             account_holder_name: billingDetails.account_name,
//                             account_holder_type: 'individual',
//                         },
//                     });
//
//                     // Then create external account using the token
//                     bankAccount = await stripe.accounts.createExternalAccount(
//                         customerAccount.stripeAccountId,
//                         {
//                             external_account: bankToken.id
//                         }
//                     );
//                 } catch (tokenError: any) {
//                     console.error('Bank token creation error:', tokenError);
//                     throw new CustomError({
//                         message: `Unable to link bank account: ${tokenError.message}`,
//                         code: StatusCodes.BAD_REQUEST
//                     });
//                 }
//             }
//
//             // Store details on the wallet table
//             await WalletModel.findOneAndUpdate(
//                 { userId: payload.userId },
//                 {
//                     $push: {
//                         bankAccounts: {
//                             stripeBankAccountId: bankAccount.id,
//                             bankName: billingDetails.bank_name,
//                             accountNumber: billingDetails.account_number,
//                             accountName: billingDetails.account_name,
//                             bankCode: billingDetails.bank_code || billingDetails.sort_code,
//                             routingNumber: routingNumber,
//                             isDefault: payload.isDefault || false
//                         }
//                     }
//                 }
//             );
//         } else {
//             bankAccount = existingAccount;
//         }
//
//         const existingTransaction = await TransactionModel.findOne({
//             txnReference: reference
//         });
//
//         if (existingTransaction) {
//             throw new CustomError({
//                 message: 'Duplicate transaction reference',
//                 code: StatusCodes.CONFLICT
//             });
//         }
//
//         const transaction:any = await TransactionModel.create([{
//             walletId: wallet._id,
//             userId: wallet.userId,
//             transactionType: 'withdrawal',
//             amount: payload.amount,
//             currency: wallet.currency,
//             txnReference: reference,
//             status: 'pending',
//             reason: `Withdrawal of ${payload.amount} ${wallet.currency}`,
//             metaData: {
//                 bankName: billingDetails.bank_name,
//                 accountNumber: billingDetails.account_number,
//                 accountName: billingDetails.account_name,
//                 bankCode: billingDetails.bank_code || billingDetails.sort_code,
//             }
//         }]);
//
//         let transferAmount = payload.amount;
//         if (wallet.currency.toLowerCase() !== 'ngn') {
//             const exchangeRate = await getExchangeRate(wallet.currency, 'NGN');
//             transferAmount = payload.amount * exchangeRate;
//         }
//
//         // Method 1: Transfer + Payout approach
//         try {
//             // Create a transfer to the connected account
//             const stripeTransfer = await stripe.transfers.create({
//                 amount: Math.round(transferAmount * 100), // Convert to cents
//                 currency: 'ngn',
//                 destination: customerAccount.stripeAccountId,
//                 metadata: {
//                     transactionId: transaction[0]._id.toString(),
//                     reference: reference,
//                     userId: payload.userId
//                 },
//                 description: `Withdrawal to ${billingDetails.bank_name} (${billingDetails.account_number})`
//             });
//
//             // Then create a payout from the connected account to the bank account
//             const payout = await stripe.payouts.create(
//                 {
//                     amount: Math.round(transferAmount * 100),
//                     currency: 'ngn',
//                     method: 'standard',
//                     destination: bankAccount.id,
//                     metadata: {
//                         transactionId: transaction[0]._id.toString(),
//                         reference: reference
//                     },
//                     description: `Payout to ${billingDetails.account_name} at ${billingDetails.bank_name}`
//                 },
//                 {
//                     stripeAccount: customerAccount.stripeAccountId
//                 }
//             );
//
//             // Update transaction with Stripe reference IDs
//             await TransactionModel.findByIdAndUpdate(
//                 transaction[0]._id,
//                 {
//                     'metadata.stripeTransferId': stripeTransfer.id,
//                     'metadata.stripePayoutId': payout.id,
//                     status: 'processing'
//                 }
//             );
//         } catch (transferError: any) {
//             console.error('Transfer/Payout error:', transferError);
//
//             // Method 2: Direct payout (alternative approach)
//             try {
//                 const directPayout = await stripe.payouts.create({
//                     amount: Math.round(transferAmount * 100),
//                     currency: 'ngn',
//                     method: 'standard',
//                     destination: bankAccount.id,
//                     metadata: {
//                         transactionId: transaction[0]._id.toString(),
//                         reference: reference,
//                         userId: payload.userId
//                     },
//                     description: `Direct payout to ${billingDetails.account_name} at ${billingDetails.bank_name}`
//                 });
//
//                 // Update transaction with direct payout ID
//                 await TransactionModel.findByIdAndUpdate(
//                     transaction[0]._id,
//                     {
//                         'metadata.stripeDirectPayoutId': directPayout.id,
//                         status: 'processing'
//                     }
//                 );
//             } catch (payoutError: any) {
//                 console.error('Direct payout error:', payoutError);
//
//                 // Update transaction as failed
//                 await TransactionModel.findByIdAndUpdate(
//                     transaction[0]._id,
//                     {
//                         status: 'failed',
//                         'metadata.error': payoutError.message
//                     }
//                 );
//
//                 throw new CustomError({
//                     message: `Failed to process withdrawal: ${payoutError.message}`,
//                     code: StatusCodes.INTERNAL_SERVER_ERROR
//                 });
//             }
//         }
//
//         const oldBalance = wallet.balance;
//         const newBalance = oldBalance - payload.amount;
//
//         await WalletModel.findOneAndUpdate(
//             { userId: payload.userId },
//             { $set: { balance: newBalance } }
//         ).lean().exec();
//
//         await LedgerModel.create([{
//             walletId: wallet._id,
//             transactionId: transaction[0]._id,
//             type: 'debit',
//             amount: payload.amount,
//             balanceBefore: oldBalance,
//             balanceAfter: newBalance,
//             description: `Withdrawal of ${payload.amount} ${wallet.currency}`,
//         }]);
//
//         await client.del(`wallet:${wallet.userId}`);
//
//         return {
//             transaction: transaction[0],
//             wallet: {
//                 id: wallet._id,
//                 balance: newBalance,
//                 currency: wallet.currency
//             }
//         };
//     } catch(error: any) {
//         if (error instanceof CustomError) throw error;
//         console.error('Withdrawal error:', error);
//         throw new CustomError({
//             message: error.message || 'Failed to process withdrawal',
//             code: StatusCodes.INTERNAL_SERVER_ERROR
//         });
//     }
// }
const createPinService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const userDetails = yield wallet_model_1.WalletModel.findOne({
        userId: payload.userId,
    }).lean().exec();
    if (!userDetails) {
        throw new App_1.CustomError({
            message: 'No account found for this user',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    if (userDetails.walletPin) {
        throw new App_1.CustomError({
            message: 'wallet has an active pin',
            code: http_status_codes_1.StatusCodes.BAD_REQUEST
        });
    }
    const hashedPin = yield bcryptjs_1.default.hash(payload.pin, 10);
    yield wallet_model_1.WalletModel.findOneAndUpdate({
        userId: payload.userId,
    }, {
        walletPin: hashedPin
    }, { new: true });
    return true;
});
exports.createPinService = createPinService;
const getExchangeRate = (fromCurrency, toCurrency, amount) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const appId = process.env.XE_APP_ID;
        const appKey = process.env.XE_APP_KEY;
        const credentials = Buffer.from(`${appId}:${appKey}`).toString('base64');
        try {
            const response = yield axios_1.default.get('https://xecdapi.xe.com/v1/convert_from.json/', {
                params: {
                    from: fromCurrency,
                    to: toCurrency,
                    amount: amount
                },
                headers: {
                    'Authorization': `Basic ${credentials}`
                }
            });
            const data = response.data;
            // Extract the rate
            if (data.to && data.to.length > 0) {
                const conversion = data.to[0]; // Get first (and likely only) conversion
                const rate = conversion.mid;
                const targetCurrency = conversion.quotecurrency;
                console.log(`Exchange Rate: 1 ${fromCurrency} = ${rate} ${targetCurrency}`);
                console.log(`Converting ${amount} ${fromCurrency} = ${(amount * rate).toFixed(2)} ${targetCurrency}`);
                console.log(`Timestamp: ${data.timestamp}`);
                return {
                    fromCurrency: data.from,
                    toCurrency: targetCurrency,
                    rate: rate,
                    amount: data.amount,
                    convertedAmount: amount * rate,
                    timestamp: data.timestamp
                };
            }
            else {
                throw new Error('No conversion data found in response');
            }
        }
        catch (error) {
            console.error('Error getting exchange rate:', ((_a = error.response) === null || _a === void 0 ? void 0 : _a.data) || error.message);
            throw error;
        }
    }
    catch (error) {
        console.error('Error fetching currencies:', error);
        throw new App_1.CustomError({
            message: `Could not determine exchange rate from ${fromCurrency} to ${toCurrency}`,
            code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
        });
    }
});
exports.getExchangeRate = getExchangeRate;
const allCurrencies = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const appId = process.env.XE_APP_ID;
        const appKey = process.env.XE_APP_KEY;
        const credentials = Buffer.from(`${appId}:${appKey}`).toString('base64');
        const response = yield axios_1.default.get('https://xecdapi.xe.com/v1/currencies', {
            headers: {
                'Authorization': `Basic ${credentials}`
            }
        });
        return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.currencies;
    }
    catch (error) {
        console.error('Error fetching currencies:', error);
        throw new App_1.CustomError({
            message: `Could not fetch currencies`,
            code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
        });
    }
});
exports.allCurrencies = allCurrencies;
const autoWithdrawWalletService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reference = (0, reference_1.default)(payload.userId);
    const client = yield app_1.redis_client.getRedisClient();
    try {
        if (!payload.amount || payload.amount <= 0) {
            throw new App_1.CustomError({
                message: 'Invalid withdrawal amount',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId, status: 'active' });
        const userDetails = yield user_model_1.default.findOne({ userId: payload.userId });
        const billingDetails = yield billing_model_1.BillingModel.findOne({ user_id: payload.userId }).lean().exec();
        const portfolioDetaills = yield PortfolioModel.findOne({ userId: payload.userId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: 'Wallet not found or is not active',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (!billingDetails) {
            throw new App_1.CustomError({
                message: 'Billing details not found',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const verifyPin = yield bcryptjs_1.default.compare(payload.pin, wallet.walletPin);
        if (!verifyPin) {
            throw new App_1.CustomError({
                message: "Invalid transaction pin",
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED
            });
        }
        // 4. VALIDATE CURRENCY
        const supportedCurrencies = ['usd', 'ng', 'eur', 'gbp', 'aud', 'cad', 'chf', 'sgd'];
        const withdrawalCurrency = (payload.currency || wallet.currency || 'usd').toLowerCase();
        if (!supportedCurrencies.includes(withdrawalCurrency)) {
            throw new App_1.CustomError({
                message: `Currency ${withdrawalCurrency} is not supported for withdrawals. Supported currencies: ${supportedCurrencies.join(', ')}`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // 5. ENSURE PLATFORM AND USER ACCOUNT COUNTRIES MATCH
        // This is critical for Stripe transfers
        let customerAccount = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId });
        // Get country info
        countries.registerLocale(enLocale);
        const countryCode = (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.country) || 'US';
        // Important: Get proper format for Stripe
        const formattedCountryCode = countries.getAlpha2Code(countryCode, 'en') || 'US';
        // 6. CREATE OR GET STRIPE CONNECTED ACCOUNT
        if (!(customerAccount === null || customerAccount === void 0 ? void 0 : customerAccount.stripeAccountId)) {
            // IMPORTANT: Create account in same region as your platform
            const account = yield stripe_1.default.accounts.create({
                type: 'custom',
                country: formattedCountryCode, // 'NG' for Nigeria
                email: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
                capabilities: {
                    card_payments: { requested: true },
                    transfers: { requested: true },
                },
                business_type: 'individual',
                business_profile: {
                    mcc: '5734', // e.g., 5734 = Computer Software Stores (choose based on your platform)
                    url: (userDetails === null || userDetails === void 0 ? void 0 : userDetails.website) || 'https://www.fotolocker.io/',
                },
                individual: {
                    first_name: (userDetails === null || userDetails === void 0 ? void 0 : userDetails.business_name) || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.first_name) || 'User',
                    last_name: (userDetails === null || userDetails === void 0 ? void 0 : userDetails.last_name) || portfolioDetaills.username || 'Account',
                    email: userDetails === null || userDetails === void 0 ? void 0 : userDetails.email,
                    phone: '5555555555',
                    ssn_last_4: '1234',
                    dob: {
                        day: 1,
                        month: 1,
                        year: 1990,
                    },
                    address: {
                        city: 'New York',
                        line1: '123 Main Street',
                        postal_code: '10001',
                        state: 'NY', // ✅ Must be a valid US state code (e.g., NY for New York)
                        country: 'US',
                    },
                },
                settings: {
                    payouts: {
                        schedule: { interval: 'manual' },
                    },
                    payments: {
                        statement_descriptor: portfolioDetaills === null || portfolioDetaills === void 0 ? void 0 : portfolioDetaills.businessName,
                    },
                },
                tos_acceptance: {
                    date: Math.floor(Date.now() / 1000),
                    ip: payload.ip || '127.0.0.1'
                }
            });
            customerAccount = yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, { stripeAccountId: account.id }, { new: true });
        }
        // 7. CHECK FOR EXISTING BANK ACCOUNTS
        const existingAccounts = yield stripe_1.default.accounts.listExternalAccounts(customerAccount === null || customerAccount === void 0 ? void 0 : customerAccount.stripeAccountId, { object: 'bank_account', limit: 10 });
        const existingAccount = existingAccounts.data.find((acc) => acc.account_number === billingDetails.account_number &&
            acc.bank_name === billingDetails.bank_name);
        // 8. CREATE BANK ACCOUNT IF NEEDED
        let bankAccount;
        if (!existingAccount) {
            try {
                // SIMPLIFIED BANK ACCOUNT CREATION
                // Match bank account country with the connected account country
                const bankParams = {
                    external_account: {
                        object: 'bank_account',
                        country: formattedCountryCode,
                        currency: getCurrencyForCountry(formattedCountryCode),
                        account_number: (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.account_number) || (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.accountNumber),
                        account_holder_name: billingDetails.account_name,
                        account_holder_type: 'individual'
                    }
                };
                // Add routing number for countries that need it
                if (['US', 'CA', 'GB', 'AU'].includes(formattedCountryCode)) {
                    bankParams.external_account.routing_number =
                        (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.sort_code) ||
                            (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.routing_number) ||
                            getDefaultRoutingNumber(formattedCountryCode);
                }
                console.log('Creating external account with params:', JSON.stringify(bankParams, null, 2));
                // Create the bank account with appropriate parameters
                bankAccount = yield stripe_1.default.accounts.createExternalAccount(customerAccount.stripeAccountId, bankParams);
                console.log('Bank account created successfully:', bankAccount.id);
                // Store bank account in wallet
                yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, {
                    $push: {
                        bankAccounts: {
                            stripeBankAccountId: bankAccount.id,
                            bankName: billingDetails.bank_name,
                            accountNumber: billingDetails.account_number || billingDetails.accountNumber,
                            accountName: billingDetails.account_name,
                            bankCode: billingDetails.bank_code || billingDetails.sort_code,
                            country: formattedCountryCode,
                            currency: bankAccount.currency,
                            isDefault: payload.isDefault || false
                        }
                    }
                });
            }
            catch (bankError) {
                // HANDLE UNSUPPORTED COUNTRIES OR BANK ERRORS WITH MANUAL PROCESSING
                return handleManualProcessing(wallet, billingDetails, payload, withdrawalCurrency, reference, bankError, client);
            }
        }
        else {
            bankAccount = existingAccount;
        }
        // 9. CREATE TRANSACTION RECORD
        const transaction = yield createTransactionRecord(wallet, payload, withdrawalCurrency, reference, billingDetails);
        // 10. CALCULATE TRANSFER AMOUNT WITH CURRENCY CONVERSION IF NEEDED
        let transferAmount = payload.amount;
        if (wallet.currency.toLowerCase() !== withdrawalCurrency.toLowerCase()) {
            const exchangeRate = yield (0, exports.getExchangeRate)(wallet.currency, withdrawalCurrency.toUpperCase(), payload.amount);
            transferAmount = payload.amount * exchangeRate;
        }
        // 11. PROCESS STRIPE TRANSFER AND PAYOUT
        try {
            // IMPORTANT: Now using direct payout instead of transfer + payout
            // This avoids the cross-region transfer issue
            const payout = yield stripe_1.default.payouts.create({
                amount: Math.round(transferAmount * 100),
                currency: withdrawalCurrency,
                method: 'standard',
                destination: bankAccount.id,
                metadata: {
                    transactionId: transaction[0]._id.toString(),
                    reference: reference
                },
                description: `Payout to ${billingDetails.account_name} at ${billingDetails.bank_name}`
            }, {
                stripeAccount: customerAccount.stripeAccountId
            });
            // Update transaction with Stripe ID
            yield transaction_model_1.TransactionModel.findByIdAndUpdate(transaction[0]._id, {
                'metadata.stripePayoutId': payout.id,
                status: 'processing'
            });
        }
        catch (payoutError) {
            console.error('Payout error:', payoutError);
            // Fall back to manual processing
            return handleManualProcessing(wallet, billingDetails, payload, withdrawalCurrency, reference, payoutError, client, transaction[0]._id);
        }
        // 12. UPDATE WALLET BALANCE AND LEDGER
        const oldBalance = wallet.balance;
        const newBalance = oldBalance - payload.amount;
        yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, { $set: { balance: newBalance } }).lean().exec();
        yield wallet_model_1.LedgerModel.create([{
                walletId: wallet._id,
                transactionId: transaction[0]._id,
                type: 'debit',
                amount: payload.amount,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                description: `Withdrawal of ${payload.amount} ${withdrawalCurrency}`,
            }]);
        yield client.del(`wallet:${wallet.userId}`);
        return {
            transaction: transaction[0],
            wallet: {
                id: wallet._id,
                balance: newBalance,
                currency: wallet.currency
            }
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        console.error('Withdrawal error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to process withdrawal',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.autoWithdrawWalletService = autoWithdrawWalletService;
const withdrawWalletService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    try {
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId, status: 'active' });
        const userDetails = yield user_model_1.default.findOne({ userId: payload.userId });
        const billingDetails = yield billing_model_1.BillingModel.findOne({ user_id: payload.userId }).lean().exec();
        const portfolioDetaills = yield PortfolioModel.findOne({ userId: payload.userId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: 'Wallet not found or is not active',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (!billingDetails) {
            throw new App_1.CustomError({
                message: 'Billing details not found',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // 4. VALIDATE CURRENCY
        const supportedCurrencies = ['usd', 'ng', 'eur', 'gbp', 'aud', 'cad', 'chf', 'sgd'];
        const withdrawalCurrency = (payload.currency || wallet.currency || 'usd').toLowerCase();
        if (!supportedCurrencies.includes(withdrawalCurrency)) {
            throw new App_1.CustomError({
                message: `Currency ${withdrawalCurrency} is not supported for withdrawals. Supported currencies: ${supportedCurrencies.join(', ')}`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // 5. ENSURE PLATFORM AND USER ACCOUNT COUNTRIES MATCH
        // This is critical for Stripe transfers
        let customerAccount = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId });
        // Get country info
        countries.registerLocale(enLocale);
        const countryCode = (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.country) || 'US';
        // Important: Get proper format for Stripe
        const formattedCountryCode = countries.getAlpha2Code(countryCode, 'en') || 'US';
        // 9. GET TRANSACTION RECORD
        const transaction = yield getTransactionRecord(payload.transactionReference);
        const adminUser = yield user_model_1.default.findOne({ _id: payload.adminId });
        if (!adminUser || !payload.adminId.includes(adminUser.role)) { // Assuming adminUser has a 'role' field
            throw new App_1.CustomError({
                message: 'Unauthorized: Only administrators can approve/reject withdrawals',
                code: http_status_codes_1.StatusCodes.FORBIDDEN
            });
        }
        // 10. CALCULATE TRANSFER AMOUNT WITH CURRENCY CONVERSION IF NEEDED
        let transferAmount = payload.amount;
        if (wallet.currency.toLowerCase() !== withdrawalCurrency.toLowerCase()) {
            const exchangeRate = yield (0, exports.getExchangeRate)(wallet.currency, withdrawalCurrency.toUpperCase(), payload.amount);
            transferAmount = payload.amount * exchangeRate;
        }
        // 12. UPDATE WALLET BALANCE AND LEDGER
        const oldBalance = wallet.balance;
        const newBalance = oldBalance - payload.amount;
        yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, { $set: { balance: newBalance } }).lean().exec();
        yield wallet_model_1.LedgerModel.create([{
                walletId: wallet._id,
                transactionId: transaction[0]._id,
                type: 'debit',
                amount: payload.amount,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                description: `Withdrawal of ${payload.amount} ${withdrawalCurrency}`,
            }]);
        yield client.del(`wallet:${wallet.userId}`);
        return {
            transaction: transaction[0],
            wallet: {
                id: wallet._id,
                balance: newBalance,
                currency: wallet.currency
            }
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        console.error('Withdrawal error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to process withdrawal',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.withdrawWalletService = withdrawWalletService;
const initWithdrawalService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const reference = (0, reference_1.default)(payload.userId);
    const client = yield app_1.redis_client.getRedisClient();
    try {
        if (!payload.amount || payload.amount <= 0) {
            throw new App_1.CustomError({
                message: 'Invalid withdrawal amount',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId, status: 'active' });
        const userDetails = yield user_model_1.default.findOne({ userId: payload.userId });
        const billingDetails = yield billing_model_1.BillingModel.findOne({ user_id: payload.userId }).lean().exec();
        if (!wallet) {
            throw new App_1.CustomError({
                message: 'Wallet not found or is not active',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (!billingDetails) {
            throw new App_1.CustomError({
                message: 'Billing details not found',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        if (!(wallet === null || wallet === void 0 ? void 0 : wallet.walletPin)) {
            throw new App_1.CustomError({
                message: 'Please reset your wallet-Pin',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const verifyPin = yield bcryptjs_1.default.compare(payload.transactionPin, wallet === null || wallet === void 0 ? void 0 : wallet.walletPin);
        if (!verifyPin) {
            throw new App_1.CustomError({
                message: "Invalid transaction pin",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // 4. VALIDATE CURRENCY
        const supportedCurrencies = ['usd', 'ng', 'eur', 'gbp', 'aud', 'cad', 'chf', 'sgd'];
        const withdrawalCurrency = (payload.currency || wallet.currency || 'usd').toLowerCase();
        if (!supportedCurrencies.includes(withdrawalCurrency)) {
            throw new App_1.CustomError({
                message: `Currency ${withdrawalCurrency} is not supported for withdrawals. Supported currencies: ${supportedCurrencies.join(', ')}`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        let customerAccount = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId });
        if (customerAccount.balance < payload.amount) {
            throw new App_1.CustomError({
                message: 'Insufficient funds',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        // Get country info
        countries.registerLocale(enLocale);
        const countryCode = (billingDetails === null || billingDetails === void 0 ? void 0 : billingDetails.country) || (userDetails === null || userDetails === void 0 ? void 0 : userDetails.country) || 'US';
        // Important: Get proper format for Stripe
        const formattedCountryCode = countries.getAlpha2Code(countryCode, 'en') || 'US';
        // 9. CREATE TRANSACTION RECORD
        const transaction = yield createTransactionRecord(wallet, payload, withdrawalCurrency, reference, billingDetails);
        // 10. CALCULATE TRANSFER AMOUNT WITH CURRENCY CONVERSION IF NEEDED
        let transferAmount = payload.amount;
        if (wallet.currency.toLowerCase() !== withdrawalCurrency.toLowerCase()) {
            const exchangeRate = yield (0, exports.getExchangeRate)(wallet.currency, withdrawalCurrency.toUpperCase(), payload.amount);
            transferAmount = payload.amount * exchangeRate;
        }
        yield client.del(`wallet:${wallet.userId}`);
        return {
            transaction: transaction[0],
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        console.error('Withdrawal error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to process withdrawal',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.initWithdrawalService = initWithdrawalService;
const updateWalletBalance = (userId, amount, operation) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    try {
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: 'Wallet not found',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (operation === 'debit') {
            wallet.balance -= amount;
        }
        else { // credit
            wallet.balance += amount;
        }
        yield wallet.save();
        yield client.del(`wallet:${userId}`); // Invalidate Redis cache for this wallet
    }
    catch (error) {
        console.error(`Error updating wallet balance for user ${userId}:`, error);
        throw error; // Re-throw to be caught by the caller
    }
});
const debitWalletAndCreateLedger = (wallet, transaction, amount, withdrawalCurrency) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient();
    const session = yield wallet_model_1.WalletModel.startSession(); // Start a session for atomicity
    try {
        session.startTransaction();
        const oldBalance = wallet.balance;
        const newBalance = oldBalance - amount;
        if (newBalance < 0) {
            throw new App_1.CustomError({
                message: 'Insufficient funds for withdrawal after admin approval (unexpected state)',
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR // This should ideally be caught earlier
            });
        }
        // Debit the wallet
        yield wallet_model_1.WalletModel.findOneAndUpdate({ _id: wallet._id }, { $set: { balance: newBalance } }, { session, new: true } // Ensure the update is part of the session
        );
        // Create ledger entry
        yield wallet_model_1.LedgerModel.create([{
                walletId: wallet._id,
                transactionId: transaction._id,
                type: 'debit',
                amount: amount,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                description: `Withdrawal approved: ${amount} ${withdrawalCurrency.toUpperCase()}`,
            }], { session });
        yield session.commitTransaction();
        yield client.del(`wallet:${wallet.userId}`); // Invalidate Redis cache
        return newBalance;
    }
    catch (error) {
        yield session.abortTransaction();
        yield client.del(`wallet:${wallet.userId}`); // Invalidate Redis cache
        throw error;
    }
    finally {
        session.endSession();
    }
});
const adminApproveWithdrawalService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const client = yield app_1.redis_client.getRedisClient(); // Get Redis client for cache invalidation
    try {
        const { transactionReference, adminId } = payload;
        const adminUser = yield user_model_1.default.findOne({ _id: adminId });
        if (!adminUser || !constants_1.UserRole.ADMIN.includes(adminUser.role)) {
            throw new App_1.CustomError({
                message: 'Unauthorized: Only administrators can approve withdrawals',
                code: http_status_codes_1.StatusCodes.FORBIDDEN
            });
        }
        // Get the pending withdrawal transaction - REMOVED .lean() to preserve Mongoose methods
        const transaction = yield transaction_model_1.TransactionModel.findOne({
            txnReference: transactionReference,
            transactionType: 'withdrawal',
        }).exec(); // Only .exec(), no .lean()
        if (!transaction) {
            throw new App_1.CustomError({
                message: 'Transaction not found.',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (transaction.transactionType !== 'withdrawal') {
            throw new App_1.CustomError({
                message: 'This transaction is not a withdrawal request.',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        if (transaction.txnStatus !== 'PENDING') {
            throw new App_1.CustomError({
                message: `Withdrawal has already been ${transaction.txnStatus}.`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        //Get user's wallet and details
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: transaction.userId, status: 'active' });
        const userDetails = yield user_model_1.default.findOne({ _id: transaction.userId }); // Use _id from transaction
        if (!wallet) {
            throw new App_1.CustomError({
                message: 'Wallet not found for the user associated with this transaction or is not active.',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        if (!userDetails) {
            throw new App_1.CustomError({
                message: 'User details not found for the user associated with this transaction.',
                code: http_status_codes_1.StatusCodes.NOT_FOUND
            });
        }
        //Validate Currency (redundant if already checked in initWithdrawal, but good for safety)
        const supportedCurrencies = ['usd', 'ng', 'eur', 'gbp', 'aud', 'cad', 'chf', 'sgd'];
        const withdrawalCurrency = (transaction.currency || wallet.currency || 'usd').toLowerCase();
        if (!supportedCurrencies.includes(withdrawalCurrency)) {
            throw new App_1.CustomError({
                message: `Currency ${withdrawalCurrency} is not supported for withdrawals.`,
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        //Calculate final transfer amount (if currency conversion is involved)
        let finalWithdrawalAmount = transaction.amount; // Use the amount recorded in the transaction
        if (wallet.currency.toLowerCase() !== withdrawalCurrency.toLowerCase()) {
            const exchangeRate = yield (0, exports.getExchangeRate)(wallet.currency, withdrawalCurrency.toUpperCase(), transaction.amount);
            finalWithdrawalAmount = transaction.amount * exchangeRate;
        }
        //Check for sufficient funds *before* debiting (double-check, though init should have done this)
        if (wallet.balance < finalWithdrawalAmount) {
            // If this happens, it indicates a race condition or a bug.
            transaction.txnStatus = 'FAILED';
            transaction.message = 'Withdrawal failed: Insufficient funds at time of admin approval.';
            transaction.processedBy = adminId;
            transaction.processedAt = new Date();
            yield transaction.save(); // Now this will work
            yield client.del(`transaction:${transaction._id}`); // Invalidate cache
            yield new App_1.EmailService().withdrawalNotificationMail("Your Withdrawal Has Been Rejected!", userDetails.email, userDetails.business_name, finalWithdrawalAmount, withdrawalCurrency, transactionReference, "FAILED");
            throw new App_1.CustomError({
                message: 'Insufficient funds to complete withdrawal even after initial check. Transaction marked as failed.',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        //Debit the user's account and create ledger entry using the helper
        const newWalletBalance = yield debitWalletAndCreateLedger(wallet, transaction, finalWithdrawalAmount, withdrawalCurrency);
        //Update transaction status to 'approved'
        transaction.txnStatus = 'COMPLETED';
        transaction.message = 'Withdrawal successfully approved by admin.';
        transaction.processedBy = adminId;
        transaction.processedAt = new Date();
        yield transaction.save(); // Now this will work
        // Invalidate Redis cache for this transaction and potentially user transactions list
        yield client.del(`transaction:${transaction._id}`);
        yield client.del(`transactions:user:${transaction.userId}`);
        //Send email to the user on completed approval
        if (userDetails.email) {
            const gallery_url = "https://www.fotolocker.io/client-sign-in";
            yield new App_1.EmailService().withdrawalNotificationMail("Your Withdrawal Has Been Approved!", userDetails.email, userDetails.business_name, finalWithdrawalAmount, withdrawalCurrency, transactionReference, "COMPLETED");
        }
        return {
            transaction,
            wallet: {
                id: wallet._id,
                balance: newWalletBalance,
                currency: wallet.currency
            }
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError)
            throw error;
        console.error('Admin approval withdrawal error:', error);
        throw new App_1.CustomError({
            message: error.message || 'Failed to process withdrawal approval',
            code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
        });
    }
});
exports.adminApproveWithdrawalService = adminApproveWithdrawalService;
function getCurrencyForCountry(countryCode) {
    const currencyMap = {
        'US': 'usd',
        'GB': 'gbp',
        'EU': 'eur',
        'DE': 'eur',
        'FR': 'eur',
        'IT': 'eur',
        'ES': 'eur',
        'CA': 'cad',
        'AU': 'aud',
        'SG': 'sgd',
        'CH': 'chf'
    };
    return currencyMap[countryCode] || 'usd';
}
function getDefaultRoutingNumber(countryCode) {
    // Default test routing numbers for Stripe test mode
    const routingMap = {
        'US': '110000000',
        'CA': '11000-000',
        'GB': '108800',
        'AU': '110000'
    };
    return routingMap[countryCode] || '110000000';
}
function createTransactionRecord(wallet, payload, currency, reference, billingDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        // Check for duplicate transactions
        const existingTransaction = yield transaction_model_1.TransactionModel.findOne({
            txnReference: reference
        });
        if (existingTransaction) {
            throw new App_1.CustomError({
                message: 'Duplicate transaction reference',
                code: http_status_codes_1.StatusCodes.CONFLICT
            });
        }
        return transaction_model_1.TransactionModel.create([{
                walletId: wallet._id,
                userId: wallet.userId,
                transactionType: 'withdrawal',
                amount: payload.amount,
                currency: currency,
                txnReference: reference,
                packageType: "Withdrawal",
                status: 'pending',
                reason: `Withdrawal of ${payload.amount} ${currency}`,
                metaData: {
                    bankName: billingDetails.bank_name,
                    accountNumber: billingDetails.account_number || billingDetails.accountNumber,
                    accountName: billingDetails.account_name,
                    bankCode: billingDetails.bank_code || billingDetails.sort_code,
                    country: billingDetails.country
                }
            }]);
    });
}
function handleManualProcessing(wallet, billingDetails, payload, currency, reference, error, client, existingTransactionId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Create or update transaction for manual processing
        let transaction;
        if (existingTransactionId) {
            // Update existing transaction
            transaction = yield transaction_model_1.TransactionModel.findByIdAndUpdate(existingTransactionId, {
                status: 'pending_manual_process',
                'metadata.error': error.message,
                'metadata.requiresManualAction': true
            }, { new: true });
        }
        else {
            // Create new transaction
            transaction = yield transaction_model_1.TransactionModel.create([{
                    walletId: wallet._id,
                    userId: wallet.userId,
                    transactionType: 'withdrawal',
                    amount: payload.amount,
                    currency: currency,
                    txnReference: reference,
                    status: 'pending_manual_process',
                    reason: `Withdrawal of ${payload.amount} ${currency} (requires manual processing)`,
                    metaData: {
                        bankName: billingDetails.bank_name,
                        accountNumber: billingDetails.account_number || billingDetails.accountNumber,
                        accountName: billingDetails.account_name,
                        bankCode: billingDetails.bank_code || billingDetails.sort_code,
                        country: billingDetails.country,
                        error: error.message,
                        requiresManualProcessing: true
                    }
                }]);
        }
        // Update wallet balance
        const oldBalance = wallet.balance;
        const newBalance = oldBalance - payload.amount;
        yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, { $set: { balance: newBalance } }).lean().exec();
        // Record in ledger
        yield wallet_model_1.LedgerModel.create([{
                walletId: wallet._id,
                transactionId: existingTransactionId || transaction[0]._id,
                type: 'debit',
                amount: payload.amount,
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                description: `Withdrawal of ${payload.amount} ${currency} (pending manual processing)`,
            }]);
        yield client.del(`wallet:${wallet.userId}`);
        return {
            transaction: existingTransactionId ? transaction : transaction[0],
            wallet: {
                id: wallet._id,
                balance: newBalance,
                currency: wallet.currency
            },
            message: "Withdrawal request received. Due to international banking regulations, this transaction will be processed manually by our team within 1-3 business days."
        };
    });
}
function getTransactionRecord(reference) {
    return __awaiter(this, void 0, void 0, function* () {
        const existingTransaction = yield transaction_model_1.TransactionModel.findOne({
            txnReference: reference,
            transactionType: 'withdrawal',
            txnStatus: 'PENDING'
        }).lean().exec();
        console.log();
        if (!existingTransaction) {
            throw new App_1.CustomError({
                message: 'Pending withdrawal transaction not found',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
    });
}
function allWithdrawalsService(filter) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = {
                transactionType: 'withdrawal'
            };
            if (filter) {
                query.txnStatus = filter.toString().toUpperCase();
            }
            const response = yield transaction_model_1.TransactionModel.find(query).populate("userId", "-password")
                .lean()
                .exec();
            return response;
        }
        catch (error) {
            console.error('Error fetching withdrawal transactions:', error);
            throw new App_1.CustomError({
                message: 'Error fetching transactions',
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    });
}
function singleWithdrawalsService(id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const query = {
                transactionType: 'withdrawal'
            };
            if (id) {
                query._id = id;
            }
            const response = yield transaction_model_1.TransactionModel.findOne(query).populate("userId")
                .lean()
                .exec();
            return response;
        }
        catch (error) {
            console.error('Error fetching withdrawal transactions:', error);
            throw new App_1.CustomError({
                message: 'Error fetching transactions',
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    });
}
const listBanksService = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const url = "https://api.paystack.co/bank";
        const response = yield axios_1.default.get(url, {
            headers: {
                'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        // Return the banks data from Paystack response
        return {
            success: true,
            data: response.data.data, // Paystack returns data in response.data.data
            message: response.data.message || 'Banks retrieved successfully'
        };
    }
    catch (error) {
        // Handle different types of errors
        if (error.response) {
            // Paystack API error
            throw new App_1.CustomError({
                message: ((_a = error.response.data) === null || _a === void 0 ? void 0 : _a.message) || 'Failed to fetch banks from Paystack',
                code: error.response.status || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
        else if (error.request) {
            // Network error
            throw new App_1.CustomError({
                message: 'Network error: Unable to connect to Paystack',
                code: http_status_codes_1.StatusCodes.SERVICE_UNAVAILABLE
            });
        }
        else {
            // Other errors
            throw new App_1.CustomError({
                message: error.message || 'Failed to retrieve banks',
                code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR
            });
        }
    }
});
exports.listBanksService = listBanksService;
const resetPinService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user details
        const user = yield user_model_1.default.findById(payload.userId);
        if (!user) {
            throw new App_1.CustomError({
                message: "User not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        // Check if user has a wallet
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: "Wallet not found for this user",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        // Check if user has a PIN to reset
        if (!wallet.walletPin) {
            throw new App_1.CustomError({
                message: "No PIN found to reset. Please create a PIN first.",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Generate OTP
        const otp = otp_generator_1.default.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        console.log("Reset PIN OTP:", otp);
        // Save OTP in Redis with key prefix for PIN reset
        const client = yield app_1.redis_client.getRedisClient();
        const otpKey = `pin_reset_${user.email}`;
        yield client.set(otpKey, yield bcryptjs_1.default.hash(otp, 10), "EX", 60 * 10); // 10 minutes expiry
        // Send OTP to user email
        yield new App_1.EmailService().sendOTP("PIN Reset Verification", user.email, user.business_name || user.email.split('@')[0], otp);
        return {
            message: "OTP sent to your email for PIN reset verification",
            email: user.email
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError) {
            throw error;
        }
        throw new App_1.CustomError({
            message: error.message || "Failed to initiate PIN reset",
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.resetPinService = resetPinService;
const verifyOtpAndResetPinService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Find user details
        const user = yield user_model_1.default.findById(payload.userId);
        if (!user) {
            throw new App_1.CustomError({
                message: "User not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        // Verify OTP from Redis
        const client = yield app_1.redis_client.getRedisClient();
        const otpKey = `pin_reset_${user.email}`;
        const hashedOtp = yield client.get(otpKey);
        if (!hashedOtp) {
            throw new App_1.CustomError({
                message: "OTP has expired or is invalid. Please request a new PIN reset.",
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
            });
        }
        // Compare provided OTP with stored hash
        const isOtpValid = yield bcryptjs_1.default.compare(payload.otp, hashedOtp);
        if (!isOtpValid) {
            throw new App_1.CustomError({
                message: "Invalid OTP. Please check and try again.",
                code: http_status_codes_1.StatusCodes.UNAUTHORIZED,
            });
        }
        // Validate new PIN (should be 4-6 digits)
        if (!/^\d{4,6}$/.test(payload.newPin)) {
            throw new App_1.CustomError({
                message: "PIN must be between 4-6 digits",
                code: http_status_codes_1.StatusCodes.BAD_REQUEST,
            });
        }
        // Find user's wallet
        const wallet = yield wallet_model_1.WalletModel.findOne({ userId: payload.userId });
        if (!wallet) {
            throw new App_1.CustomError({
                message: "Wallet not found for this user",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        // Check if new PIN is different from current PIN
        if (wallet.walletPin) {
            const isSamePin = yield bcryptjs_1.default.compare(payload.newPin, wallet.walletPin);
            if (isSamePin) {
                throw new App_1.CustomError({
                    message: "New PIN must be different from current PIN",
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
        }
        // Hash new PIN and update wallet
        const hashedNewPin = yield bcryptjs_1.default.hash(payload.newPin, 10);
        yield wallet_model_1.WalletModel.findOneAndUpdate({ userId: payload.userId }, { walletPin: hashedNewPin }, { new: true });
        // Delete OTP from Redis after successful verification
        yield client.del(otpKey);
        // Send confirmation email (reusing sendOTP method for simplicity)
        try {
            yield new App_1.EmailService().sendOTP("PIN Reset Successful", user.email, user.business_name || user.email.split('@')[0], "Your wallet PIN has been successfully reset.");
        }
        catch (emailError) {
            // Don't fail the entire operation if email fails
            console.error("Failed to send PIN reset confirmation email:", emailError);
        }
        return {
            message: "PIN reset successfully",
            success: true
        };
    }
    catch (error) {
        if (error instanceof App_1.CustomError) {
            throw error;
        }
        throw new App_1.CustomError({
            message: error.message || "Failed to reset PIN",
            code: error.code || http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
        });
    }
});
exports.verifyOtpAndResetPinService = verifyOtpAndResetPinService;
