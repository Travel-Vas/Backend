import mongoose from "mongoose";

const suspensionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    suspendedAt: { type: Date, default: Date.now },
    reason: { type: String, required: true },
    evidence: { type: Object, default: {} },
    status: { type: String, enum: ['active', 'lifted'], default: 'active' },
    suspensionType: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    reviewRequired: { type: Boolean, default: true },
    liftedAt: { type: Date },
    liftedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const moderationLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    isInappropriate: { type: Boolean, required: true },
    confidence: { type: Number, min: 0, max: 100 },
    service: { type: String, default: 'Google Vision' },
    details: { type: Object, default: {} }
}, { timestamps: true });

export const SuspensionModel = mongoose.model('Suspension', suspensionSchema);
export const ModerationLogModel = mongoose.model('ModerationLog', moderationLogSchema);
