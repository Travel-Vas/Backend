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
exports._emptyBinService = exports._recycleBinService = exports._testRecordService = exports._deleteRecordService = exports._testRecordsService = exports._test = void 0;
const user_model_1 = __importDefault(require("../users/user.model"));
const http_status_codes_1 = require("http-status-codes");
const App_1 = require("../../helpers/lib/App");
const test_models_1 = __importDefault(require("./test.models"));
const participants_model_1 = __importDefault(require("../participants/participants.model"));
const organization_model_1 = __importDefault(require("../organization/organization.model"));
const _test = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield participants_model_1.default
        .findOne({ participants_id: data.participantId })
        .exec();
    let test_record;
    if (!isExist) {
        throw new App_1.CustomError({
            message: "user not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    try {
        test_record = new test_models_1.default(data);
        yield test_record.save();
    }
    catch (error) {
        console.log(error);
    }
    console.log(test_record);
    return test_record;
});
exports._test = _test;
const _testRecordsService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testRecords = yield test_models_1.default.find({ isDeleted: false }).lean().exec();
        if (!testRecords || testRecords.length === 0) {
            throw new App_1.CustomError({
                message: "No test records found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        const recordsWithParticipants = yield Promise.all(testRecords.map((record) => __awaiter(void 0, void 0, void 0, function* () {
            const participants = yield participants_model_1.default.find({ participants_id: record.participantId }).populate({ path: "createdBy", select: "full_name" }).lean().exec();
            const organizations = yield organization_model_1.default.find({ orgId: record.organizationId }).lean().exec();
            return Object.assign(Object.assign({}, record), { participants,
                organizations });
        })));
        return recordsWithParticipants;
    }
    catch (error) {
        console.error("Error in _testRecordsService:", error);
        throw error;
    }
});
exports._testRecordsService = _testRecordsService;
const _deleteRecordService = (id, flag, deleted) => __awaiter(void 0, void 0, void 0, function* () {
    // Check if the record exists
    const isExist = yield test_models_1.default.findById(id).exec();
    if (!isExist) {
        throw new App_1.CustomError({
            message: "Record not found",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    if (deleted) {
        yield test_models_1.default.findByIdAndDelete(id).exec();
        return "Record deleted  delete permanently";
    }
    if (flag) {
        yield test_models_1.default.findByIdAndUpdate(id, { isDeleted: false }, { new: true }).lean().exec();
        return "Record restored";
    }
    else {
        // Soft delete: Set the isDeleted flag to true
        yield test_models_1.default.findByIdAndUpdate(id, { isDeleted: true }, { new: true }).lean().exec();
        return "Record deleted (soft delete)";
    }
});
exports._deleteRecordService = _deleteRecordService;
const _testRecordService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const testRecord = yield test_models_1.default.findOne({ _id: id }).exec();
        if (!testRecord) {
            throw new App_1.CustomError({
                message: "Test record not found",
                code: http_status_codes_1.StatusCodes.NOT_FOUND,
            });
        }
        const participants = yield participants_model_1.default
            .find({ participants_id: testRecord.participantId })
            .lean()
            .exec();
        // Combine the test record and participants data
        const recordWithParticipants = Object.assign(Object.assign({}, testRecord.toObject()), { // Convert testRecord to a plain object if it's a Mongoose document
            participants });
        return recordWithParticipants; // Return the combined result
    }
    catch (error) {
        console.error("Error in _testRecordService:", error);
        throw error;
    }
});
exports._testRecordService = _testRecordService;
const _recycleBinService = (id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Resolve all promises simultaneously with Promise.all
        let response;
        const [organizations, coordinators, participants, testRecords] = yield Promise.all([
            organization_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            user_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            participants_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            test_models_1.default.find({ isDeleted: true }).lean().exec(),
        ]);
        // Return or process the results as needed
        let totalLength = 0;
        totalLength += organizations.length + coordinators.length + participants.length + testRecords.length;
        return { organizations, coordinators, participants, testRecords, totalLength };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Something went wrong",
            code: 500,
            ctx: { data: error },
        });
    }
});
exports._recycleBinService = _recycleBinService;
const _emptyBinService = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [organizations, coordinators, participants, test] = yield Promise.all([
            organization_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            user_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            participants_model_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
            test_models_1.default.find({ isDeleted: true }).lean().select("-password").exec(),
        ]);
        // Calculate total length
        const totalLength = organizations.length + coordinators.length + participants.length;
        yield Promise.all([
            organization_model_1.default.deleteMany({ isDeleted: true }).exec(),
            user_model_1.default.deleteMany({ isDeleted: true }).exec(),
            participants_model_1.default.deleteMany({ isDeleted: true }).exec(),
            test_models_1.default.deleteMany({ isDeleted: true }).exec()
        ]);
        return { organizations, coordinators, participants, test, totalLength };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: "Something went wrong while emptying the bin",
            code: 500,
            ctx: { error: error.message },
        });
    }
});
exports._emptyBinService = _emptyBinService;
