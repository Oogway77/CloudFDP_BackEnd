const log4js = require('log4js');
const log4jsExtend = require('log4js-extend');
const { BRANCH, SHORT } = require('../config/config');

const layout = {
    type: 'pattern',
    pattern: '%d %p [%X{userId}] %m',
};

log4js.configure({
    appenders: {
        out: {
            type: 'stdout',
            layout,
        },
        file: {
            type: 'dateFile',
            filename: `${__dirname}/../logs/fair_solution`,
            pattern: `.yyyy-MM-dd-${BRANCH}-${SHORT}.log`,
            alwaysIncludePattern: true,
            layout,
        },
    },
    categories: {
        default: {
            appenders: ['out', 'file'],
            level: 'debug',
        },
    },
});

log4jsExtend(log4js, {
    path: __dirname,
    format: '(at @name @file:@line:@column)',
});

const logger = log4js.getLogger();
logger.addContext('userId', '');

module.exports = logger;
