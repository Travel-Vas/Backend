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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientsService = void 0;
const clients_model_1 = __importDefault(require("./clients.model"));
const App_1 = require("../../helpers/lib/App");
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = __importDefault(require("mongoose"));
const edited_shoots_model_1 = __importDefault(require("../photoshoots/edited_shoots.model"));
const shoots_model_1 = require("../photoshoots/shoots.model");
const transaction_model_1 = require("../transactions/transaction.model");
class ClientsService {
    constructor() { }
    createClientService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Check if client exists by email
                const clientExist = yield clients_model_1.default.findOne({
                    email: payload.email,
                    user_id: payload.user_id,
                }).lean().exec();
                if (clientExist) {
                    throw new App_1.CustomError({
                        message: 'Client with this email already exists',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    });
                }
                // Check if client exists by name
                const clientNameExist = yield clients_model_1.default.findOne({
                    name: payload.name,
                    user_id: payload.user_id,
                }).lean();
                if (clientNameExist) {
                    throw new App_1.CustomError({
                        message: 'Client with this name already exists',
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    });
                }
                // Create the client
                const response = yield clients_model_1.default.create(payload);
                return response;
            }
            catch (error) {
                // Handle MongoDB duplicate key error specifically
                if (error.code === 11000) {
                    const field = Object.keys(error.keyPattern)[0];
                    throw new App_1.CustomError({
                        message: `Client with this ${field} already exists`,
                        code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                    });
                }
                // Pass through CustomError or create a new one
                if (error instanceof App_1.CustomError) {
                    throw error;
                }
                throw new App_1.CustomError({
                    message: error.message || 'Error creating client',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    getUsersClients(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clients = yield clients_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(userId),
                    deleted_at: null,
                })
                    .sort({ created_at: -1 });
                return clients;
            }
            catch (e) {
                throw new App_1.CustomError({
                    message: 'Error fetching clients',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    recentClients(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const clients = yield clients_model_1.default.find({
                    user_id: new mongoose_1.default.Types.ObjectId(userId),
                    deleted_at: null,
                })
                    .sort({ created_at: -1 })
                    .limit(5);
                const clientData = yield Promise.all(clients.map((client) => __awaiter(this, void 0, void 0, function* () {
                    const shoots = yield shoots_model_1.ShootsModel.find({ client_id: client._id });
                    const transactions = yield transaction_model_1.TransactionModel.find({ clientId: client._id }).select("amount");
                    return Object.assign(Object.assign({}, client.toObject()), { shootCount: shoots.length, totalAmount: transactions.reduce((sum, t) => sum + (Number(t.amount) || 0), 0) });
                })));
                return clientData;
            }
            catch (e) {
                throw new App_1.CustomError({
                    message: 'Error fetching recent clients',
                    code: http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR,
                });
            }
        });
    }
    getClientService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const client_id = new mongoose_1.default.Types.ObjectId(payload.clientId);
            const response = yield clients_model_1.default.findOne({
                _id: client_id // Use the converted ObjectId
            }).exec();
            return response;
        });
    }
    updateClientService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientExist = yield clients_model_1.default.findOne({
                _id: payload.clientId
            });
            if (!clientExist) {
                throw new App_1.CustomError({
                    message: 'Client id is invalid',
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
            const { clientId } = payload, newPayload = __rest(payload, ["clientId"]);
            const updatedClient = yield clients_model_1.default.findOneAndUpdate({ _id: clientId }, { $set: newPayload }, {
                new: true,
            });
            if (!updatedClient) {
                throw new App_1.CustomError({
                    message: 'Update Failed',
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST
                });
            }
            return updatedClient;
        });
    }
    deleteClientService(payload) {
        return __awaiter(this, void 0, void 0, function* () {
            const clientExist = yield clients_model_1.default.findOne({
                _id: payload.clientId
            });
            if (!clientExist) {
                throw new App_1.CustomError({
                    message: 'Client id is invalid',
                    code: http_status_codes_1.StatusCodes.BAD_REQUEST,
                });
            }
            clientExist.deleted_at = new Date();
            yield clientExist.save();
            return clientExist;
        });
    }
    getDashboardSummaryService(userId, options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userObjectId = new mongoose_1.default.Types.ObjectId(userId);
                const [totalClients, totalEditedPhotos, totalPhotoShoots] = yield Promise.all([
                    clients_model_1.default.find({
                        user_id: userObjectId,
                        deleted_at: null,
                    }),
                    edited_shoots_model_1.default.countDocuments({
                        user_id: userObjectId,
                    }),
                    shoots_model_1.ShootsModel.countDocuments({
                        user_id: userObjectId,
                    })
                ]);
                // Use the static method directly without optional chaining
                const dates = new Date();
                const periodBounds = ClientsService.getPeriodBounds(dates, options.period);
                const startDate = options.startDate || periodBounds.start;
                const endDate = options.endDate || periodBounds.end;
                // Calculate previous period bounds
                const previousPeriodBounds = ClientsService.getPeriodBounds(new Date(startDate.getFullYear(), startDate.getMonth() - 1), options.period);
                const previousStartDate = previousPeriodBounds.start;
                const previousEndDate = previousPeriodBounds.end;
                const currentPeriodClients = totalClients.filter((client) => {
                    const createdAt = new Date(client.created_at);
                    return createdAt >= startDate && createdAt <= endDate;
                });
                const previousPeriodClients = totalClients.filter((client) => {
                    const createdAt = new Date(client.created_at);
                    return createdAt >= previousStartDate && createdAt <= previousEndDate;
                });
                const currentPeriodCount = currentPeriodClients.length;
                const previousPeriodCount = previousPeriodClients.length;
                const percentageIncrease = previousPeriodCount === 0
                    ? (currentPeriodCount > 0 ? 100 : 0)
                    : ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100;
                return {
                    currentPeriodClients,
                    previousPeriodClients,
                    currentPeriodCount,
                    previousPeriodCount,
                    percentageIncrease: Number(percentageIncrease.toFixed(2)),
                    growthStatus: percentageIncrease > 0 ? 'Growth' :
                        percentageIncrease < 0 ? 'Decline' : 'No Change',
                    totalClients,
                    totalEditedPhotos,
                    totalPhotoShoots,
                };
            }
            catch (error) {
                console.error('Error fetching dashboard summary:', error);
                throw new Error('Failed to fetch dashboard summary');
            }
        });
    }
    static getPeriodBounds(date, period) {
        const currentDate = new Date(date);
        switch (period) {
            case 'month':
                return {
                    start: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
                    end: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
                };
            case 'year':
                return {
                    start: new Date(currentDate.getFullYear(), 0, 1),
                    end: new Date(currentDate.getFullYear(), 11, 31)
                };
            case 'week':
                const first = currentDate.getDate() - currentDate.getDay();
                return {
                    start: new Date(currentDate.setDate(first)),
                    end: new Date(currentDate.setDate(first + 6))
                };
            default:
                throw new Error('Invalid period type');
        }
    }
}
exports.ClientsService = ClientsService;
