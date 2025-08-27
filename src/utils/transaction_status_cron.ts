import {CustomError} from "../helpers/lib/App";
import {StatusCodes} from "http-status-codes";
// import {TransactionModel} from "../resources/transactions/transaction.model";

export const transaction_status_cron = async () => {
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

    } catch (e: any) {
        console.error('Transaction status cron error:', e);
        throw new CustomError({
            message: 'Transaction status cron failed',
            code: e.code || StatusCodes.EXPECTATION_FAILED
        });
    }
};