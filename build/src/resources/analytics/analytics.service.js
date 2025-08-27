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
exports._vendorAggregate = void 0;
const order2_model_1 = require("../orders/order2.model");
const products_model_1 = __importDefault(require("../products/products.model"));
const transaction_model_1 = __importDefault(require("../transactions/transaction.model"));
const transactions_interface_1 = require("../transactions/transactions.interface");
const _vendorAggregate = (vendor) => __awaiter(void 0, void 0, void 0, function* () {
    const orders = yield order2_model_1.OrderItemModel.find({ vendor });
    const total_sales = orders.reduce((accumulator, currentValue) => {
        return {
            total_sales_price: accumulator.total_sales_price + currentValue.price,
            total_products_sold: accumulator.total_products_sold + currentValue.quantity
        };
    }, { total_sales_price: 0, total_products_sold: 0 });
    const products = yield products_model_1.default.find({ vendor });
    const numOfOutOfStockProducts = products.reduce((accumulator, currentValue) => {
        return {
            num_of_out_of_stock_products: currentValue.stock === 0
                ? accumulator.num_of_out_of_stock_products + 1 : accumulator.num_of_out_of_stock_products,
            total_product_rating: accumulator.total_product_rating + currentValue.rating,
            num_of_rated_products: currentValue.rating > 0 ? accumulator.num_of_rated_products + 1 : accumulator.num_of_rated_products
        };
    }, { num_of_out_of_stock_products: 0, total_product_rating: 0, num_of_rated_products: 0 });
    const withdrawalTransactions = yield transaction_model_1.default.find({ user_id: vendor, transaction_type: transactions_interface_1.TransactionType.WITHDRAWAL });
    const withdrawalAggregate = yield withdrawalTransactions.reduce((accumulator, transactions) => {
        return {
            total_amount_withdrawn: transactions.transaction_status == transactions_interface_1.TransactionStatus.SUCCESSFUL ? accumulator.total_amount_withdrawn + transactions.amount : accumulator.total_amount_withdrawn,
            pending_withdrawal_requests: transactions.transaction_status == transactions_interface_1.TransactionStatus.PENDING ? accumulator.pending_withdrawal_requests + 1 : accumulator.pending_withdrawal_requests,
            successful_withdrawal_request: transactions.transaction_status == transactions_interface_1.TransactionStatus.SUCCESSFUL ? accumulator.successful_withdrawal_request + 1 : accumulator.successful_withdrawal_request
        };
    }, { total_amount_withdrawn: 0, pending_withdrawal_requests: 0, successful_withdrawal_request: 0 });
    return Object.assign(Object.assign(Object.assign({ total_orders: orders.length }, total_sales), { total_products: products.length, num_of_out_of_stock_products: numOfOutOfStockProducts.num_of_out_of_stock_products, vendor_rating: numOfOutOfStockProducts.total_product_rating / numOfOutOfStockProducts.num_of_rated_products }), withdrawalAggregate);
});
exports._vendorAggregate = _vendorAggregate;
