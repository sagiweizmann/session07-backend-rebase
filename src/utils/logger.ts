import logzioLogger from 'logzio-nodejs';
import dotenv from 'dotenv';
dotenv.config();

export const logger = logzioLogger.createLogger({
  token: process.env.LOGZIO_TOKEN!,
  protocol: 'https',
  host: 'listener-eu.logz.io',
  port: '8071',
});
