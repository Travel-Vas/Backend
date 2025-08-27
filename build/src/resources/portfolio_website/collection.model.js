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
const constants_1 = require("../../helpers/constants");
const portfolio_model_1 = __importDefault(require("./portfolio.model"));
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
    },
    selected: {
        type: Boolean,
        default: false
    }
};
const PCollectionSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Collection name is required'],
        minlength: [3, 'Collection name must be at least 3 characters long']
    },
    accessKey: {
        type: String,
        required: [true, 'Access Key is required'],
    },
    thumbnail: {
        url: {
            type: String,
            required: true
        },
        name: {
            type: String
        },
        size: {
            type: Number
        },
        type: {
            type: String
        }
    },
    files: {
        type: [FileSchema],
        required: true,
    },
}, { timestamps: true });
PCollectionSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const portfolio = yield portfolio_model_1.default.findOne({ accessToken: this.accessKey });
            if (!portfolio) {
                throw new Error('Portfolio not found with the given access key');
            }
            this.portfolioId = portfolio._id;
            yield portfolio_model_1.default.findByIdAndUpdate(portfolio._id, {
                $addToSet: {
                    collections: this._id
                }
            });
            next();
        }
        catch (error) {
            console.error("Error updating Portfolio model with collection:", error);
            next(error);
        }
    });
});
const PCollectionModel = (0, mongoose_1.model)(constants_1.PCOLLECTION_TABLE, PCollectionSchema);
exports.default = PCollectionModel;
