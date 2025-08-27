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
exports.fetchCardDetails = exports.cardController = void 0;
const validation_1 = require("../../collection/validation");
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const card_service_1 = require("./card.service");
const cardController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        cardNumber: req.body.cardNumber,
        expirationDate: req.body.expirationDate,
        cvc: req.body.cvc,
        name: req.body.name,
        userId: req['user']._id
    };
    (0, validation_1.validate)({ cardNumber: req.body.cardNumber, expirationDate: req.body.expirationDate, cvc: req.body.cvc, name: req.body.name });
    const response = yield (0, card_service_1.cardService)(payload);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.cardController = cardController;
const fetchCardDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, card_service_1.getUserPaymentMethods)(userId);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.fetchCardDetails = fetchCardDetails;
