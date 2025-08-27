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
const mongoose_1 = require("mongoose");
const user_model_1 = __importDefault(require("../users/user.model"));
const constants_1 = require("../../helpers/constants");
const FileSchema = {
    url: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: false
    },
    size: {
        type: Number,
        required: false
    },
    type: {
        type: String,
        required: false
    }
};
const CollectionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    user_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    thumbnail: {
        type: [FileSchema],
        required: false,
    },
    event_date: {
        type: Date,
    },
    hashedAccessKey: {
        type: String
    },
    accessKey: {
        type: String
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
    },
    media: {
        type: [FileSchema],
        required: false,
    },
    showOnHomePage: {
        type: Boolean,
        default: false,
    },
    deleted_at: { type: Date, default: null }
}, {
    timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at',
    },
    optimisticConcurrency: true
});
CollectionSchema.post("save", function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield user_model_1.default.findByIdAndUpdate(doc.user_id, {
                $push: { collections: doc._id }
            });
        }
        catch (error) {
            console.log("Error pushing collection Id to user", error);
        }
    });
});
CollectionSchema.pre('findOneAndDelete', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const collection = yield this.model.findOne(this.getQuery());
            yield user_model_1.default.findByIdAndUpdate(collection.user_id, {
                $pull: { collections: collection._id }
            });
            next();
        }
        catch (error) {
            console.error('Error removing collection Id from user', error);
            next(error);
        }
    });
});
exports.default = (0, mongoose_1.model)(constants_1.COLLECTION_TABLE, CollectionSchema);
