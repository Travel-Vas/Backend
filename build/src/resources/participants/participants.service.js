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
exports._participantsDeleteService = exports._allParticipantsService = exports._participantsProfileService = exports._participantsLoginService = exports._participantsService = void 0;
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../helpers/lib/App");
const participants_model_1 = __importDefault(require("./participants.model"));
const _participantsService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    if (payload.email) {
        const isExist = yield participants_model_1.default.findOne({ email: payload.email }).exec();
        if (isExist) {
            throw new App_1.CustomError({
                message: "Participants already exist",
                code: http_status_codes_1.StatusCodes.CONFLICT
            });
        }
    }
    const response = yield participants_model_1.default.create({
        fullName: payload.fullName,
        email: payload.email,
        dob: payload.dob,
        createdBy: payload.createdBy,
        orgId: payload.orgId,
        participants_id: payload.participants_id
    });
    // await response.save()
    return response;
});
exports._participantsService = _participantsService;
const _participantsLoginService = (Id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield participants_model_1.default.findOne({ participants_id: Id }).exec();
    if (!isExist) {
        throw new App_1.CustomError({
            message: "Participants does not exist",
            code: http_status_codes_1.StatusCodes.NOT_FOUND
        });
    }
    return isExist;
});
exports._participantsLoginService = _participantsLoginService;
const _participantsProfileService = (Id) => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield participants_model_1.default.findOne({ participants_id: Id }).populate({ path: "createdBy", select: "full_name role" }).lean();
    return record;
});
exports._participantsProfileService = _participantsProfileService;
const _allParticipantsService = () => __awaiter(void 0, void 0, void 0, function* () {
    const record = yield participants_model_1.default.find().populate({ path: "createdBy", select: "full_name role organizationId" }).lean();
    const promised = [];
    for (const item of record) {
        if (item.isDeleted === false) {
            promised.push(item);
        }
    }
    return promised;
});
exports._allParticipantsService = _allParticipantsService;
const _participantsDeleteService = (id, flag, deletes) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the participant exists
    const isExist = yield participants_model_1.default.findOne({ _id: id }).lean().exec();
    if (!isExist) {
        throw new App_1.CustomError({
            message: "User not found",
            code: 404,
            ctx: { data: "Invalid ID provided" },
        });
    }
    // Handle delete flag
    if (deletes) {
        // Permanently delete the participant
        yield participants_model_1.default.findByIdAndDelete(id).exec();
        return { message: "Participant permanently deleted" };
    }
    // Handle soft delete (isDeleted flag)
    const updatedParticipant = yield participants_model_1.default
        .findByIdAndUpdate(id, { isDeleted: flag }, { new: true }) // Update isDeleted based on flag
        .lean()
        .exec();
    // Return the updated participant
    return updatedParticipant;
});
exports._participantsDeleteService = _participantsDeleteService;
