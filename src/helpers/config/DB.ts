import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const options = {
  serverSelectionTimeoutMS: 60000,
};

class DB {
  private readonly log: any;
  constructor(log: any) {
    this.log = log;
  }

  public connect(DB_URL: string) {
    const log = this.log;
    mongoose.set('strictQuery', false);
    mongoose
      .connect(DB_URL, options)
      .then(async () => {
        log.info(`========================================================`);
        log.info(`Successfully connected to `, { data: "Database" });
        log.info(`========================================================`);
      })
      .catch((err: any) => {
        log.error(`There was a db connection error`, err);
        process.exit(0);
      });
    mongoose.connection.once('disconnected', () => {
      log.error(`Successfully disconnected from Database`);
    });
    process.on('SIGINT', () => {
      mongoose.connection.close().then(() => {
        log.error('dBase connection closed due to app termination');
        process.exit(0);
      });
    });
  }
}

export default DB;
