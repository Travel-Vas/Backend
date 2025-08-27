import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares'
import IRoute from './routes/route.interface';
import 'express-async-errors';
import 'reflect-metadata';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import path from 'path';
import rateLimit from 'express-rate-limit';
import {CustomError, CustomResponse} from './helpers/lib/App';
import {globalErrorHandler} from "./utils/infraErrorHandler";
import {StatusCodes} from "http-status-codes";
import UserModel from "./resources/users/user.model";

export default class App {
    private app: Application;
    private readonly port: number;
    private readonly logger: any

    constructor(port: number, routes: IRoute[], logger: any) {
        this.app = express();
        this.port = port;
        this.logger = logger

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

    private initialMiddleware() {
        const corsOptions = {
            origin: [
                'http://localhost:3000',
                'https://fotolocker-prod.vercel.app',
                'https://staging.fotolocker.io/',
                'fotolocker-staging.vercel.app',
                'https://www.fotolocker.io',
                'https://fotolocker.io',
                'https://staging.fotolocker.io',
                'https://dashboard.stripe.com',
                '*'],
            credentials: true // allow credentials
        }

        this.app.use(cors(corsOptions));
        this.app.use(cookieParser());
        // View engine setup
        if (process.env.NODE_ENV_CPANEL) {
            this.app.set('views', path.join(__dirname, '../templates'))
        } else {
            this.app.set('views', path.join(__dirname, '../../templates'))
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

    private setupBodyParsingMiddleware() {
        // These middleware will modify the request body, so they come AFTER the webhook route
        this.app.use(express.json());
        this.app.use(rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100,
            message: {
                error: "Too many requests, please slow down"
            }
        }))
        // this.app.use(globalErrorHandler)
        this.app.use(express.urlencoded({ extended: true }));
    }

    private routeInitializer(routes: IRoute[]) {
        routes.map((router: IRoute) => {
            this.app.use('/api/v1' + router.path, router.router);
        });

        this.app.get('/', async (req:Request, res:Response) => {
            // res.render('index');  // Render the index.ejs file
                res.json("Travelvas Api now available")
        });
        this.app.get('*', (req: Request, res: CustomResponse<any>, next: NextFunction) => {
            res.status(404).json({ data: [], msg: "Not Found!" })
        });
    }

    private GlobalErrorHandler() {
        this.app.use(errorHandler);
    }

    public start() {
        this.app.listen(this.port, () => {
            this.logger.info(`========================================================`);
            this.logger.info(`App listening on port ${this.port}`);
            this.logger.info(`========================================================`);
        });
    }
}