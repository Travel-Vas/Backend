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
exports._allParticipants = exports._participantsDeleteController = exports._participantsProfileController = exports._participantsLoginController = exports._participantsController = void 0;
const http_status_codes_1 = require("http-status-codes");
const participants_service_1 = require("./participants.service");
const generator_1 = __importDefault(require("../../helpers/lib/generator"));
const notification_service_1 = require("../notificatoin/notification.service");
const _participantsController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        fullName: req.body.fullName,
        email: req.body.email,
        dob: req.body.dob,
        participants_id: (0, generator_1.default)(),
        createdBy: req.body.createdBy,
        orgId: req.body.orgId
    };
    const response = yield (0, participants_service_1._participantsService)(payload);
    try {
        const newNotification = {
            userId: payload.createdBy,
            operationName: "Participants Registration",
            message: `${payload.fullName} just successfully got registered`
        };
        const newNotifications = yield (0, notification_service_1._notificationService)(newNotification);
    }
    catch (error) {
        console.log(error);
    }
    return res.json({
        msg: "user created successfully",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.CREATED
    });
});
exports._participantsController = _participantsController;
const _participantsLoginController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.body.participants_id;
    const response = yield (0, participants_service_1._participantsLoginService)(Id);
    return res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports._participantsLoginController = _participantsLoginController;
const _participantsProfileController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.params.id;
    const response = yield (0, participants_service_1._participantsProfileService)(Id);
    return res.json({
        msg: "OK",
        data: response || [],
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports._participantsProfileController = _participantsProfileController;
const _participantsDeleteController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const Id = req.query.id;
    const flag = req.query.flag;
    const response = yield (0, participants_service_1._participantsDeleteService)(Id, flag, req.query.deletes);
    return res.json({
        msg: "OK",
        data: response || [],
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports._participantsDeleteController = _participantsDeleteController;
const _allParticipants = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, participants_service_1._allParticipantsService)();
    return res.json({
        msg: "OK",
        data: response || [],
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports._allParticipants = _allParticipants;
