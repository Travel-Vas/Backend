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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const middlewares_1 = require("./middlewares");
require("express-async-errors");
require("reflect-metadata");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const path_1 = __importDefault(require("path"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
class App {
    constructor(port, routes, logger) {
        this.app = (0, express_1.default)();
        this.port = port;
        this.logger = logger;
        // Set up initial middleware that doesn't interfere with raw body
        this.initialMiddleware();
        // Register the Stripe webhook route BEFORE JSON parsing middleware
        // this.setupPaystackWeebhookRoute()
        // Set up the rest of the middleware that could modify the request body
        this.setupBodyParsingMiddleware();
        // Initialize routes
        this.routeInitializer(routes);
        // Set up error handling
        this.GlobalErrorHandler();
    }
    initialMiddleware() {
        const corsOptions = {
            origin: [
                'http://localhost:3000',
                'https://landing-page-phi-sooty.vercel.app/',
                'https://www.mytravelvas.com',
                'https://dashboard.stripe.com',
                'https://www.mytravelvas.com',
                '*'
            ],
            credentials: true // allow credentials
        };
        this.app.use((0, cors_1.default)(corsOptions));
        this.app.use((0, cookie_parser_1.default)());
        // View engine setup
        if (process.env.NODE_ENV_CPANEL) {
            this.app.set('views', path_1.default.join(__dirname, '../templates'));
        }
        else {
            this.app.set('views', path_1.default.join(__dirname, '../../templates'));
        }
        this.app.set('view engine', 'ejs');
    }
    // private setupPaystackWeebhookRoute() {
    //     this.app.post(
    //         '/api/v1/paystack/webhook',
    //         bodyParser.raw({ type: '*/*' }),
    //         paystackWebhook
    //     );
    // }
    setupBodyParsingMiddleware() {
        // These middleware will modify the request body, so they come AFTER the webhook route
        this.app.use(express_1.default.json());
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100,
            message: {
                error: "Too many requests, please slow down"
            }
        }));
        // this.app.use(globalErrorHandler)
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    routeInitializer(routes) {
        routes.map((router) => {
            this.app.use('/api/v1' + router.path, router.router);
        });
        this.app.get('/', (req, res) => __awaiter(this, void 0, void 0, function* () {
            // res.render('index');  // Render the index.ejs file
            res.json("Travelvas Api now available");
        }));
        this.app.get('*', (req, res, next) => {
            res.status(404).json({ data: [], msg: "Not Found!" });
        });
    }
    GlobalErrorHandler() {
        this.app.use(middlewares_1.errorHandler);
    }
    start() {
        this.app.listen(this.port, () => {
            this.logger.info(`========================================================`);
            this.logger.info(`App listening on port ${this.port}`);
            this.logger.info(`========================================================`);
        });
    }
}
exports.default = App;
