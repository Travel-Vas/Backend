"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const participantsSchema = new mongoose_1.Schema({
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String
    },
    dob: {
        type: String
    },
    participants_id: {
        type: String,
        required: true,
        unique: true
    },
    role: {
        type: String,
        default: "Participant"
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Employees",
    },
    orgId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Organization"
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });
exports.default = (0, mongoose_1.model)(constants_1.PARTICIPANTS, participantsSchema);
