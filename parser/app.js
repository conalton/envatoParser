const moment = require('moment');
const config = require('./config');

const { createLogger, format, transports } = require("winston");

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

if (!config) {
    logger.fatal('Config.json is empty or not found');
    return;
}

if (!config?.api.token) {
    logger.fatal('Api token not present in config');
    return;
}

const {DataManager} = require('./dataManager');
const {doApiRequest} = require('./request');

DataManager.init(config.database).then((connection) => {
    const doParse = async (date, term) => {
        var isFirst = true;

        const call = (page, term) => {
            logger.info(`Parsing : page = ${page}, term = ${term}`);

            doApiRequest(config.api, '/discovery/search/search/item', {
                term,
                page,
                page_size: 100,
                category: config.category,
                date: 'this-day'
            }).then(data => {
                if (data?.matches && Array.isArray(data?.matches)) {
                    data.matches = data.matches.filter(item => item?.id);

                    data.matches.forEach(async (item) => {
                        item.tags = item.tags && Array.isArray(item.tags) ? JSON.stringify(item.tags) : null;

                        await DataManager.addGoodIfNotExists(item);

                        item.date = date;
                        item.term = term ? term : null;
                        item.published_at = item.published_at ? new Date(item.published_at) : null;
                        item.updated_at = item.updated_at ? new Date(item.updated_at) : item.updated_at;

                        await DataManager.addItem(item);
                    });
                }

                if (isFirst && data?.aggregations?.cost) {
                    isFirst = false;

                    const aggregatesKeys = ['avg', 'count', 'max', 'min', 'sum'];
                    const aggregates = {};
                    aggregatesKeys.forEach(key => {
                        aggregates['cost_' + key] = data.aggregations.cost[key] !== undefined
                        && data.aggregations.cost[key] !== null ? data.aggregations.cost[key] : 0;
                    })

                    DataManager.addAggregate({...aggregates, date, term})
                }

                if (data?.links?.next_page_url) {
                    page++;

                    return call(page, term);
                }

            }, rejectStatus => {
                logger.error(`term :${term}, perfroming page failed: ${page}`);

                if (rejectStatus?.response?.status === 429 && rejectStatus?.response?.headers?.['Retry-After']) {
                    const waitTime = rejectStatus?.response?.headers?.['Retry-After'];
                    //не более 3 часов
                    if (waitTime < 3 * 3600) {
                        setTimeout(waitTime * 1000, () => {
                            call(page, term);
                        });

                    }
                }
            }).catch(err => {
                logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
            })

        }

        call(1, term);
    }

    if (Array.isArray(config.terms)) {
        const parseFunc = () => {
            logger.info('Start parsing...');

            let date = (new Date()).setHours(0, 0, 0);
            date = moment(date).utcOffset(0, true).toDate();

            config.terms.forEach(async (term) => {
                await doParse(date, term);
            });

            logger.info(`End parsing`);
        }

        //Мгновенный парсинг
        parseFunc();

        //Парсит каждые 24 часа
        setInterval(() => {
            parseFunc();
        }, 24 * 60 * 60 * 1000);

    }
}).catch(err => {
    logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});


