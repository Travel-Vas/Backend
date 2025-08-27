import IRoute from './route.interface';
import userRouter from '../resources/users/user.router';
import SettingsRoutes from "../resources/settings/settings.routes";
import BookingRoutes from "../resources/booking/booking.routes";
import PaymentRoutes from "../resources/booking/payment.routes";

export default [
  userRouter,
  SettingsRoutes,
  BookingRoutes,
  PaymentRoutes
];
