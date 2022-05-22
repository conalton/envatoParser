const moment = require('moment');
const config = require('./config');
const logger = require('./logger').default;

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
const {GoodsSales} = require("./models/GoodsSales");

DataManager.init(config.database).then((connection) => {
    const doParse = async (date, term, currentDay = true) => {
        var isFirst = true;

        const call = (page, term) => {
            logger.info(`Parsing : page = ${page}, term = ${term}`);

            const query = {
                term,
                page,
                page_size: 100,
                category: config.category,
                date: currentDay ? 'this-day' : undefined,
                sort_by: 'updated',
                sort_direction: 'desc'
            };

            const parseDate = (dateStr) => {
                return new Date(moment(dateStr, "YYYY-MM-DDTHH:mm:ss [Z]").utcOffset(0, true).format('YYYY-MM-DD HH:mm:ss'))
            }

            doApiRequest(config.api, '/discovery/search/search/item', query).then(data => {
                logger.info(`Results : page = ${page}, term = ${term}, size = ${data?.matches?.length}`);

                if (data?.matches && Array.isArray(data?.matches)) {
                    data.matches = data.matches.filter(item => item?.id);

                    data.matches.forEach(async (item) => {
                        item.tags = item.tags && Array.isArray(item.tags) ? JSON.stringify(item.tags) : null;

                        await DataManager.addGoodIfNotExists(item);

                        item.date = parseDate(item?.published_at);
                        item?.date?.setHours(0, 0, 0, 0);
                        item.term = term ? term : null;
                        item.updated_at = item.updated_at ? parseDate(item.updated_at) : null;

                        if (!item?.date) {
                            return logger.warn('item.date is empty, item : ' + JSON.stringify(item));
                        }

                        await DataManager.addItem(item);
                    });
                }

                //Aggregates only for last day
                if (isFirst && currentDay && data?.aggregations?.cost) {
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

                    //Wait no more than 3 hours
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
        const parseFunc = async () => {
            logger.info('Start parsing...');

            const currentDay = await GoodsSales.findOne() !== null;

            let date = (new Date()).setHours(0, 0, 0);
            date = moment(date).utcOffset(0, true).toDate();

            config.terms.forEach((term) => {
                doParse(date, term, currentDay);
            });

            logger.info(`End parsing`);
        }

        parseFunc();

        //Parsing every 24 hours
        setInterval(() => {
            parseFunc();
        }, 24 * 60 * 60 * 1000);

    }
}).catch(err => {
    logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});


