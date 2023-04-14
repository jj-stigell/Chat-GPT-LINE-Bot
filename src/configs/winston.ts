import winston from 'winston';

import { NODE_ENV } from './environment';

const levels: winston.config.AbstractConfigSetLevels = {
  error: 0,
  warn: 1,
  http: 2,
  info: 3,
  debug: 4,
};

const level: string = ((): string => {
  switch (NODE_ENV) {
  case 'production':
    return 'info';
  case 'test':
    return 'error';
  default:
    return 'debug';
  }
})();

const colors: winston.config.AbstractConfigSetColors = {
  error: 'red',
  warn: 'yellow',
  http: 'magenta',
  info: 'green',
  debug: 'white',
};

winston.addColors(colors);

const format: winston.Logform.Format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (http: winston.Logform.TransformableInfo) => `${http.timestamp} ${http.level}: ${http.message}`,
  ),
);

// https://github.com/winstonjs/winston/blob/master/docs/transports.md
const transports: [
  winston.transports.ConsoleTransportInstance,
  winston.transports.FileTransportInstance,
  winston.transports.FileTransportInstance
] = [
  new winston.transports.Console(),
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    handleExceptions: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }),
  new winston.transports.File({ filename: 'logs/all.log' }),
];

const logger: winston.Logger = winston.createLogger({
  level,
  levels,
  format,
  transports,
});

export default logger;
