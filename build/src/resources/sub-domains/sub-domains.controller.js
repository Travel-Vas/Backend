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
exports.createSubDomain = void 0;
const status_codes_1 = require("http-status-codes/build/cjs/status-codes");
const sub_domain_service_1 = require("./sub-domain.service");
const createSubDomain = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        userId: req.body.photographerId,
        subDomain: req.body.subDomain.toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^a-z0-9-]/g, ''),
    };
    const subdomain = `${payload.subDomain}.${process.env.DOMAIN}`;
    const newPayload = Object.assign(Object.assign({}, payload), { subDomain: subdomain });
    const response = yield (0, sub_domain_service_1.subDomainService)(newPayload);
    res.json({
        msg: "domain created successfully",
        data: response,
        statusCode: status_codes_1.StatusCodes.CREATED
    });
});
exports.createSubDomain = createSubDomain;
