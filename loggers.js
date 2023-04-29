// const winston = require('winston');

// // Define a custom format that includes a timestamp and dynamic prefix
// const logFormat = winston.format.combine(
//   winston.format.timestamp(),
//   winston.format.printf(info => {
//     return `${info.timestamp} [${info.prefix}] ${info.message}`;
//   })
// );

// // Create a new Winston logger instance
// const logger = winston.createLogger({
//   level: 'info',
//   format: logFormat,
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: 'logfile.log' })
//   ]
// });

// // Set a dynamic prefix for the logger
// const prefix = 'limca';

// // Log a message with the dynamic prefix and timestamp
// logger.info('Hello, world!', { prefix });


const { createLogger, format, transports } = require('winston');
const { combine, timestamp, label, printf } = format;
const fs = require('fs');

// Define log format
const logFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${label}] ${level}: ${message}`;
});

// Define logger function
function createFileLogger(prefix) {
  const logDir = './logs';
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
  }

  const logFilename = `${logDir}/${prefix}.log`;

  const logger = createLogger({
    format: combine(
      label({ label: prefix }),
      timestamp(),
      logFormat
    ),
    transports: [
      new transports.File({ filename: logFilename })
    ]
  });

  return logger;
}

// Example usage
const myLogger = createFileLogger(subdomain);
myLogger.verbose('This is a debug log message');
