import logzioLogger from 'logzio-nodejs';
import dotenv from 'dotenv';
dotenv.config();

export const logger = logzioLogger.createLogger({
  token: process.env.LOGZIO_TOKEN!,
  host: 'listener.logz.io',
  type: 'users-service',
  protocol: 'https'
});
