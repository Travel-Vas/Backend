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
exports._updateCartItem = exports._emptyCart = exports._getCart = exports._addToCart = void 0;
const cart_model_1 = __importDefault(require("./cart.model"));
const App_1 = require("../../helpers/lib/App");
const mongoose_1 = require("mongoose");
const _addToCart = (userId, productId, quantity, variation) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productsModel.findById(productId);
    if (!product)
        throw new App_1.CustomError({ message: "Product Not Found", code: 404 });
    let cart = yield cart_model_1.default.findOne({ user: userId });
    if (!cart) {
        cart = new cart_model_1.default({ user: userId, items: [{ product_id: productId, quantity, variation, vendor: product.vendor }], total_price: product.price * quantity });
        yield cart.save();
        return (0, exports._getCart)(userId);
    }
    const itemIndex = cart.items.findIndex((item) => item.product_id.toString() == productId);
    if (itemIndex < 0) {
        let productIdToObjectId = new mongoose_1.Types.ObjectId(productId);
        cart.items.push({ product_id: productIdToObjectId, quantity, vendor: product.vendor });
    }
    else {
        if (quantity == 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            cart.items[itemIndex].quantity += quantity;
        }
    }
    cart.total_price = cart.total_price + (product.price * quantity);
    yield cart.save();
    return (0, exports._getCart)(userId);
});
exports._addToCart = _addToCart;
const _getCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield cart_model_1.default.aggregate([
        {
            $match: {
                user: userId
            }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: 'products',
                localField: 'items.product_id',
                foreignField: '_id',
                as: 'productDetails'
            }
        },
        {
            $unwind: "$productDetails"
        },
        {
            $addFields: {
                "items.product_name": "$productDetails.name",
                "items.product_price": "$productDetails.price",
                "items.total_item_price": { $multiply: ["$items.quantity", "$productDetails.price"] }
            }
        },
        {
            $group: {
                _id: "$_id",
                user: { $first: "$user" },
                items: { $push: "$items" },
                created_at: { $first: "$created_at" },
                updated_at: { $first: "$updated_at" },
                total_price: { $sum: "$items.total_item_price" }
            }
        },
        {
            $project: {
                user: 1,
                total_price: 1,
                created_at: 1,
                updated_at: 1,
                items: {
                    product_id: 1,
                    quantity: 1,
                    product_name: 1,
                    vendor: 1,
                    product_price: 1,
                    total_item_price: 1,
                    variation: 1
                }
            }
        }
    ]);
    if (res.length > 0)
        return res[0];
    return {};
});
exports._getCart = _getCart;
const _emptyCart = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const cart = yield cart_model_1.default.findOne({ user: userId });
    if (!cart)
        throw new App_1.CustomError({ message: "Not Found", code: 404 });
    cart.items = [];
    cart.total_price = 0;
    yield cart.save();
    return cart;
});
exports._emptyCart = _emptyCart;
const _updateCartItem = (userId, productId, quantity) => __awaiter(void 0, void 0, void 0, function* () {
    const product = yield productsModel.findById(productId);
    if (!product)
        throw new App_1.CustomError({ message: "Product Not Found", code: 404 });
    let cart = yield cart_model_1.default.findOne({ user: userId });
    if (!cart) {
        cart = new cart_model_1.default({ user: userId, items: [{ product_id: productId, quantity }], total_price: product.price * quantity });
        yield cart.save();
        return (0, exports._getCart)(userId);
    }
    const itemIndex = cart.items.findIndex((item) => item.product_id.toString() == productId);
    if (itemIndex < 0) {
        let productIdToObjectId = new mongoose_1.Types.ObjectId(productId);
        cart.items.push({ product_id: productIdToObjectId, quantity, vendor: product.vendor });
    }
    else {
        if (quantity == 0) {
            cart.items.splice(itemIndex, 1);
        }
        else {
            cart.items[itemIndex].quantity = quantity;
        }
    }
    cart.total_price = cart.total_price + (product.price * quantity);
    yield cart.save();
    return (0, exports._getCart)(userId);
});
exports._updateCartItem = _updateCartItem;
