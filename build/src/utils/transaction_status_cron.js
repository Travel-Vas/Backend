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
exports.transaction_status_cron = void 0;
const App_1 = require("../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
// import {TransactionModel} from "../resources/transactions/transaction.model";
const transaction_status_cron = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const currentTime = new Date();
        const fiveMinutesAgo = new Date(currentTime.getTime() - 5 * 60 * 1000);
        // Update transactions that are pending or processing and older than 5 minutes
        // const result = await TransactionModel.updateMany(
        //     {
        //         txnStatus: { $in: ['PENDING', 'PROCESSING'] },
        //         transactionType: {$ne: 'withdrawal'},
        //         createdAt: { $lte: fiveMinutesAgo }
        //     },
        //     {
        //         $set: {
        //             txnStatus: 'FAILED',
        //             updatedAt: currentTime
        //         }
        //     }
        // );
        // if (result.modifiedCount > 0) {
        //     console.log(`Updated ${result.modifiedCount} expired transactions to failed status`);
        // }
    }
    catch (e) {
        console.error('Transaction status cron error:', e);
        throw new App_1.CustomError({
            message: 'Transaction status cron failed',
            code: e.code || http_status_codes_1.StatusCodes.EXPECTATION_FAILED
        });
    }
});
exports.transaction_status_cron = transaction_status_cron;
