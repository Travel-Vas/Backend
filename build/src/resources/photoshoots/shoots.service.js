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
const shoots_model_1 = __importDefault(require("./shoots.model"));
class ShootsService {
    getAllShoots() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shoots_model_1.default.find().populate('client');
        });
    }
    getShootById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shoots_model_1.default.findById(id).populate('client');
        });
    }
    createShoot(shootData) {
        return __awaiter(this, void 0, void 0, function* () {
            const shoot = new shoots_model_1.default(shootData);
            return yield shoot.save();
        });
    }
    updateShoot(id, shootData) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shoots_model_1.default.findByIdAndUpdate(id, shootData, { new: true }).populate('client');
        });
    }
    deleteShoot(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield shoots_model_1.default.findByIdAndDelete(id);
        });
    }
}
exports.default = ShootsService;
