import { createClient, RedisClientType } from 'redis'

export default class RedisClient {
  private readonly log: any;
  private readonly host: any;
  private readonly port: string;
  private readonly username: string;
  private readonly password: string;
  private readonly redisClient: any
  constructor(host: string, port: string, username: string, password: string, log: any) {
    this.log = log;
    this.host = host;
    this.port = port;
    this.password = password;
    this.username = username
    this.redisClient = createClient({ url: `rediss://${this.username}:${this.password}@${this.host}:${this.port}` });
  }

  public async connect() {
    this.redisClient.on("error", (error: any) => console.error(`Error : ${error}`));

    await this.redisClient.connect().then(() => {
      this.log.log(`========================================================`);
      this.log.log('redis connected successfully')
      this.log.log(`========================================================`);
    });
  }

  public async getRedisClient() {
    return this.redisClient
  }
}
