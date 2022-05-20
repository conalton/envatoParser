const {createLogger, format, transports} = require("winston");

const logLevels = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    debug: 4,
    trace: 5,
};

const logger = createLogger({
    format: format.combine(
        format.timestamp({
            format: 'MMM-DD-YYYY HH:mm:ss'
        }),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    ),
    levels: logLevels,
    transports: [
        new (transports.Console)(),
        new transports.File({
            filename: process.cwd() + '\\logs\\parser.log',
            timestamp: true
        })],
});

module.exports.default = logger;