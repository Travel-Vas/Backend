"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModerationLogModel = exports.SuspensionModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const suspensionSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    suspendedAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    evidence: { type: Object, default: {} },
    status: { type: String, enum: ['active', 'lifted'], default: 'active' },
    suspensionType: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    reviewRequired: { type: Boolean, default: true },
    liftedAt: { type: Date },
    liftedBy: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
const moderationLogSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    isInappropriate: { type: Boolean, required: true },
    confidence: { type: Number, min: 0, max: 100 },
    service: { type: String, default: 'Google Vision' },
    details: { type: Object, default: {} }
}, { timestamps: true });
exports.SuspensionModel = mongoose_1.default.model('Suspension', suspensionSchema);
exports.ModerationLogModel = mongoose_1.default.model('ModerationLog', moderationLogSchema);
