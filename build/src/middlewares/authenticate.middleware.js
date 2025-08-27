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
exports.authenticate = authenticate;
exports.restrictTo = restrictTo;
const App_1 = require("../helpers/lib/App");
const user_model_1 = __importDefault(require("../resources/users/user.model"));
const App_2 = require("../helpers/lib/App");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authenticate(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Extract the bearer token from the authorization header
            const bearer = req.headers.authorization;
            // console.log(req.cookies);
            // console.log(bearer);
            // Check if the authorization header contains a valid Bearer token
            if (!bearer || !bearer.startsWith('Bearer')) {
                return next(new App_1.CustomError({
                    message: 'Unauthorized Access',
                    code: 401,
                    ctx: { data: 'Invalid bearer token' }
                }));
            }
            // Extract the access token from the Bearer token
            const accessToken = bearer.split('Bearer ')[1].trim();
            // Verify the access token
            const accessPayload = yield (0, App_2.verifyToken)(accessToken);
            if (accessPayload instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return next(new App_1.CustomError({
                    message: 'Access token invalid',
                    code: 401,
                    ctx: { data: 'Invalid bearer token' }
                }));
            }
            // Verify the refresh token from the cookies
            const refreshPayload = yield (0, App_2.verifyToken)(req.cookies.refresh_token);
            if (refreshPayload instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                return next(new App_1.CustomError({
                    message: 'Refresh token expired',
                    code: 403,
                    ctx: { data: 'Refresh token expired' }
                }));
            }
            // console.log('Access payload:', accessPayload);
            // Fetch the user from the database using the refresh token's payload
            const user = yield user_model_1.default.findOne({ _id: refreshPayload.id }, { __v: 0, password: 0 });
            if (!user) {
                return next(new App_1.CustomError({
                    message: 'Access token invalid',
                    code: 401,
                    ctx: { data: 'Invalid bearer token' }
                }));
            }
            // Attach the user to the request object, stripping the password field
            req.user = user.toObject({
                transform: (doc, ret) => {
                    delete ret.password;
                    return ret;
                }
            });
            // Proceed to the next middleware
            next();
        }
        catch (error) {
            // Handle errors that may occur during token verification or database lookup
            return next(new App_1.CustomError({
                message: 'Unauthorized Access',
                code: 401,
                ctx: { data: 'Invalid bearer token' },
            }));
        }
    });
}
function restrictTo(...roles) {
    return (req, res, next) => {
        if (!req.user)
            throw new App_1.CustomError({ message: 'Forbidden', code: 403 });
        if (!roles.includes(req.user.role))
            throw new App_1.CustomError({ message: 'Forbidden', code: 403 });
        next();
    };
}
