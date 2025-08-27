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
exports.getSettingsDetailsService = exports.createSettingsService = void 0;
const settings_model_1 = __importDefault(require("./settings.model"));
const createSettingsService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    const new_payload = Object.assign({}, payload);
    const existingSettings = yield settings_model_1.default.findOne({ userId: payload.userId });
    if (existingSettings) {
        // If settings exist, update them with the new payload
        yield settings_model_1.default.findOneAndUpdate({ userId: payload.userId }, { $set: new_payload }, { new: true });
        return { message: 'Settings updated successfully', updated: true };
    }
    else {
        const response = yield settings_model_1.default.create(new_payload);
        return response;
    }
});
exports.createSettingsService = createSettingsService;
const getSettingsDetailsService = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield settings_model_1.default.findOne({
        userId: userId,
    }).lean();
    return response;
});
exports.getSettingsDetailsService = getSettingsDetailsService;
