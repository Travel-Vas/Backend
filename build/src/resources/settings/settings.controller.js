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
exports.getSettingsDetails = exports.createSettings = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const settings_service_1 = require("./settings.service");
const createSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        domain_name: req.body.domain_name,
        watermark_name: req.body.watermark_name,
        watermark_font_style: req.body.font_style,
        watermark_font_size: req.body.font_size,
        watermark_color: req.body.color,
        opacity: req.body.opacity,
        watermark_url: req.files,
        userId: req['user']._id,
    };
    const response = yield (0, settings_service_1.createSettingsService)(payload);
    res.json({
        msg: "settings created successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.createSettings = createSettings;
const getSettingsDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req['user']._id;
    const response = yield (0, settings_service_1.getSettingsDetailsService)(userId);
    res.json({
        msg: "Data retrieved successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.OK
    });
});
exports.getSettingsDetails = getSettingsDetails;
