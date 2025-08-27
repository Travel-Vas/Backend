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
exports.subDomainService = void 0;
const App_1 = require("../../helpers/lib/App");
const sub_domain_model_1 = require("./sub-domain.model");
const http_status_codes_1 = require("http-status-codes");
const user_model_1 = __importDefault(require("../users/user.model"));
const axios_1 = __importDefault(require("axios"));
const subDomainService = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const isExist = yield sub_domain_model_1.SubDomainModel.findOne({ subDomain: payload.subDomain }).exec();
        if (!isExist) {
            throw new App_1.CustomError({
                message: 'Subdomain taken already',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        if (!payload.subDomain) {
            throw new App_1.CustomError({
                message: 'Subdomain is required',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        const isUser = yield user_model_1.default.findOne({
            _id: payload.userId
        });
        if (!isUser) {
            throw new App_1.CustomError({
                message: 'User not found',
                code: http_status_codes_1.StatusCodes.BAD_REQUEST
            });
        }
        yield sub_domain_model_1.SubDomainModel.create(payload);
        const url = 'https://api.namecheap.com/xml.response';
        const params = {
            ApiUser: process.env.NAMECHEAP_USERNAME,
            ApiKey: process.env.NAMECHEAP_API_KEY,
            UserName: process.env.NAMECHEAP_USERNAME,
            Command: 'namecheap.domains.dns.setHosts',
            ClientIp: process.env.NAMECHEAP_CLIENT_IP,
            SLD: 'fotolocker',
            TLD: 'io',
            HostName1: process.env.username,
            RecordType1: 'A',
            Address1: process.env.NAMECHEAP_CLIENT_IP, // Your main server IP
            TTL1: '1800'
        };
        const response = yield axios_1.default.get(url, { params });
        if (response.data.includes('Status="ERROR"')) {
            throw new Error('Namecheap API error');
        }
        return {
            data: response.data,
            subdomain: payload.subDomain,
        };
    }
    catch (error) {
        throw new App_1.CustomError({
            message: error.message,
            code: error.code
        });
    }
});
exports.subDomainService = subDomainService;
