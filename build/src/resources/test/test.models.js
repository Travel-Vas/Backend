"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const testSchema = new mongoose_1.Schema({
    participantId: {
        type: String,
        required: ["Participants Id is required"],
    },
    records: {
        type: [{}],
    },
    total_score: {
        type: String,
    },
    latency1: {
        type: String,
    },
    latency2: {
        type: String,
    },
    latency_count: {
        type: String,
    },
    total_error: {
        type: String,
    },
    cummulative_error: {
        type: Number,
    },
    average_latency: {
        type: Number,
    },
    organizationId: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
});
exports.default = (0, mongoose_1.model)(constants_1.TEST_TABLE, testSchema);
