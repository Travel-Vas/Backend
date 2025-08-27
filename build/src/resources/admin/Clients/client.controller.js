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
exports.clientsCollectionDetails = exports.clientsCollections = exports.allClients = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const client_service_1 = require("./client.service");
const allClients = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, client_service_1.allClientsService)();
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.allClients = allClients;
const clientsCollections = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client_id = req.params.client_id;
    const response = yield (0, client_service_1.clientCollectionService)(client_id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.clientsCollections = clientsCollections;
const clientsCollectionDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const client_id = req.query.client_id;
    const shoot_id = req.query.shoot_id;
    const response = yield (0, client_service_1.clientCollectionDetailsService)(client_id, shoot_id);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.clientsCollectionDetails = clientsCollectionDetails;
