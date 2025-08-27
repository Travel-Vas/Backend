import 'dotenv/config';
import App from './server';
import { DATABASE, PORT } from './helpers/constants';
import routes from './routes';
import DB from './helpers/config/DB';
import RedisClient from './helpers/config/redis-client';
import { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD, REDIS_USERNAME } from './helpers/constants';
// import RabbitMQ from './helpers/lib/App/rabbitMQ';

const app = new App(PORT, routes, console);
const db = new DB(console);
export const redis_client = new RedisClient(
  REDIS_HOST,
  REDIS_PORT,
  REDIS_USERNAME,
  REDIS_PASSWORD,
  console)
// new RabbitMQ().connect()

//start application
redis_client.connect()
db.connect(DATABASE)
app.start();
// connect to database
