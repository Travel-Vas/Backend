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
exports.emptyCartController = exports.updateItemToCartController = exports.getCartController = exports.addItemToCartController = void 0;
const cart_service_1 = require("./cart.service");
const addItemToCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id, quantity } = req.body;
    const data = yield (0, cart_service_1._addToCart)(req.user._id, product_id, quantity);
    res.status(201).json({ data, msg: "Successful" });
});
exports.addItemToCartController = addItemToCartController;
const getCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, cart_service_1._getCart)(req.user._id);
    res.status(201).json({ data, msg: "Successful" });
});
exports.getCartController = getCartController;
const updateItemToCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { product_id, quantity } = req.body;
    const data = yield (0, cart_service_1._addToCart)(req.user._id, product_id, quantity);
    res.status(200).json({ data, msg: "Successful" });
});
exports.updateItemToCartController = updateItemToCartController;
const emptyCartController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield (0, cart_service_1._emptyCart)(req.user._id);
    res.status(204).json({ data, msg: "Successful" });
});
exports.emptyCartController = emptyCartController;
