"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const constants_1 = require("../../helpers/constants");
const organizationSchema = new mongoose_1.Schema({
    name: {
        type: String,
        unique: true,
        required: true // Ensure the name is required
    },
    location: {
        type: String,
        // Optional: Add required validation if needed
    },
    phone: {
        type: String,
        // Optional: Add required validation if needed
    },
    password: {
        type: String,
        required: true
    },
    orgId: {
        type: String
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    rcNo: {
        type: String,
        required: true // Optional: Add required validation if needed
    },
    employees: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Employee' // Assuming 'Employee' is the model for the employees collection
        }],
    isVerified: {
        type: Boolean,
        default: false
    },
    role: {
        type: String,
        default: constants_1.UserRole.ORGANIZATION,
        enum: Object.values(constants_1.UserRole),
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
    }
});
exports.default = (0, mongoose_1.model)(constants_1.ORG_TABLE, organizationSchema);
