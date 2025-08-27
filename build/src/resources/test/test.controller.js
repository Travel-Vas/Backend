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
exports.emptyeBin = exports.recycleBin = exports.deleteRecord = exports.testRecord = exports.testRecords = exports.testController = void 0;
const App_1 = require("../../helpers/lib/App");
const test_service_1 = require("./test.service");
const http_status_codes_1 = require("http-status-codes");
const notification_service_1 = require("../notificatoin/notification.service");
const participants_model_1 = __importDefault(require("../participants/participants.model"));
const organization_model_1 = __importDefault(require("../organization/organization.model"));
// export const testController = async (req: Request, res: CustomResponse<any>) => {
//   const { records, total_score, cummulative_error, average_latency, total_steps } = req.body;
//   if (!Array.isArray(records) || records.length === 0) {
//     throw new CustomError({
//       message: "Records is empty",
//       code: 500,
//     });
//   }
//   // Calculate total score
//   const calculatedTotalScore = records.reduce(
//     (sum: number, record: any) => sum + (record.score || 0),
//     0
//   );
//   // Calculate total error (sum of error values)
//   const calculatedTotalError = records.reduce(
//     (sum: number, record: any) => sum + (record.error || 0),
//     0
//   );
//   const MaxErrors = 20;
//   const calculatedCumulativeError = calculatedTotalError > 0 
//     ? Math.floor(MaxErrors / calculatedTotalError)
//     : MaxErrors;
//   // Calculate total latency1
//   const totalLatency1 = records.reduce(
//     (sum: number, record: any) => sum + parseFloat(record.latency || "0"),
//     0
//   );
//   // Calculate total latency2
//   const totalLatency2 = records.reduce(
//     (sum: number, record: any) => sum + parseFloat(record.latency2 || "0"),
//     0
//   );
//   // Calculate average latency (using only latency1 values)
//   const calculatedAverageLatency = totalLatency1 / records.length;
//   // Calculate total steps
//   const calculatedTotalSteps = records.length;
//   // Prepare the response data
//   const responseData = {
//     total_score: calculatedTotalScore,
//     total_error: calculatedTotalError,
//     cummulative_error: calculatedCumulativeError,
//     average_latency: calculatedAverageLatency,
//     total_steps: calculatedTotalSteps,
//     latency1: totalLatency1,
//     latency2: totalLatency2
//   };
//   // Validate calculated values with provided values
//   if (
//     total_score !== calculatedTotalScore ||
//     cummulative_error !== calculatedCumulativeError ||
//     Math.abs(average_latency - calculatedAverageLatency) > 0.0001 ||
//     total_steps !== calculatedTotalSteps
//   ) {
//     return res.status(400).json({
//       msg: "Validation failed. Data does not align with records.",
//       data: responseData
//     });
//   }
//   // Payload creation
//   const test_payload: TestDTO = {
//     participantId: req.body.participantsId,
//     records: records,
//     ...responseData,
//     organizationId: req.body.organizationId,
//   };
//   // Save test records
//   const testRecords = await _test(test_payload);
//   // Create notification
//   const newNotification = {
//     userId: req.body.organizationId,
//     operationName: "Test Result",
//     message: `${req.body.participantsId} test submitted successfully`,
//   };
//   await _notificationService(newNotification);
//   // Response
//   return res.status(StatusCodes.CREATED).json({
//     msg: "Records created successfully",
//     data: responseData,
//     statusCode: StatusCodes.CREATED,
//   });
// };
const testController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { records, total_score, cummulative_error, average_latency, total_steps, participantsId } = req.body;
    if (!Array.isArray(records) || records.length === 0) {
        throw new App_1.CustomError({
            message: "Records is empty",
            code: 500,
        });
    }
    if (!participantsId) {
        throw new App_1.CustomError({
            message: "participantId is missing",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    const isValidParticipant = yield participants_model_1.default.findOne({ participants_id: participantsId }).populate({ path: "createdBy" }).lean().exec();
    if (!isValidParticipant) {
        throw new App_1.CustomError({
            message: "Invalid participantId",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    const isValidOrg = yield organization_model_1.default.findOne({ _id: isValidParticipant === null || isValidParticipant === void 0 ? void 0 : isValidParticipant.orgId }).exec();
    if (!isValidOrg) {
        throw new App_1.CustomError({
            message: "Invalid organizationId",
            code: http_status_codes_1.StatusCodes.NOT_FOUND,
        });
    }
    // Calculate total score
    const calculatedTotalScore = records.reduce((sum, record) => sum + (record.score || 0), 0);
    // Calculate total error (sum of error values)
    const calculatedTotalError = records.reduce((sum, record) => sum + (record.error || 0), 0);
    const MaxErrors = 20;
    const calculatedCumulativeError = calculatedTotalError > 0 ? Math.floor(MaxErrors / calculatedTotalError) : MaxErrors;
    // Calculate total latency1 and total latency2
    const totalLatency1 = records.reduce((sum, record) => sum + parseFloat(record.latency || "0"), 0);
    const totalLatency2 = records.reduce((sum, record) => sum + parseFloat(record.latency2 || "0"), 0);
    // Calculate average latency based on the sum of latency1 + latency2
    const totalLatency = totalLatency1 + totalLatency2;
    const calculatedAverageLatency = (totalLatency / records.length) * 20; // Adjusted by multiplying by 20
    // Calculate total steps
    const calculatedTotalSteps = records.length;
    // Prepare the response data
    const responseData = {
        total_score: calculatedTotalScore,
        total_error: calculatedTotalError,
        cummulative_error: calculatedCumulativeError,
        average_latency: calculatedAverageLatency,
        total_steps: calculatedTotalSteps,
        latency1: totalLatency1,
        latency2: totalLatency2,
    };
    // Validate calculated values with provided values
    if (total_score !== calculatedTotalScore ||
        cummulative_error !== calculatedCumulativeError ||
        Math.abs(average_latency - calculatedAverageLatency) > 0.0001 ||
        total_steps !== calculatedTotalSteps) {
        return res.status(400).json({
            msg: "Validation failed. Data does not align with records.",
            data: responseData,
        });
    }
    // Payload creation
    const test_payload = Object.assign(Object.assign({ participantId: req.body.participantsId, records: records }, responseData), { organizationId: isValidOrg === null || isValidOrg === void 0 ? void 0 : isValidOrg.orgId });
    // Save test records
    const testRecords = yield (0, test_service_1._test)(test_payload);
    // Create notification
    const newNotification = {
        userId: isValidOrg === null || isValidOrg === void 0 ? void 0 : isValidOrg.orgId,
        operationName: "Test Result",
        message: `${req.body.participantsId} test submitted successfully`,
    };
    yield (0, notification_service_1._notificationService)(newNotification);
    // Response
    return res.status(http_status_codes_1.StatusCodes.CREATED).json({
        msg: "Records created successfully",
        data: testRecords,
        statusCode: http_status_codes_1.StatusCodes.CREATED,
    });
});
exports.testController = testController;
const testRecords = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, test_service_1._testRecordsService)();
    res.json({
        msg: "Data Retrieved",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.testRecords = testRecords;
const testRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordId = req.query.id;
    const response = yield (0, test_service_1._testRecordService)(recordId);
    res.json({
        msg: "Data Retrieved",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.testRecord = testRecord;
const deleteRecord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const recordId = req.query.id;
    const flag = req.query.flag;
    const deleted = req.query.deletes;
    const response = yield (0, test_service_1._deleteRecordService)(recordId, flag, deleted);
    res.json({
        msg: "OK",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.deleteRecord = deleteRecord;
const recycleBin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    const response = yield (0, test_service_1._recycleBinService)(id);
    res.json({
        msg: "Data Retrieved",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.recycleBin = recycleBin;
const emptyeBin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield (0, test_service_1._emptyBinService)();
    res.json({
        msg: "Bin Empty",
        data: response,
        statusCode: http_status_codes_1.StatusCodes.OK
    });
});
exports.emptyeBin = emptyeBin;
