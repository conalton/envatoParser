const moment = require('moment');
const {doApiRequest} = require('./request');
const Helpers = require('./helpers');

const itemApiPage = '/discovery/search/search/item';
const AggregatesKeys = ['avg', 'count', 'max', 'min', 'sum'];

class ApiManager {
    apiConfig;
    logger;
    dataManager;
    fullLog;

    static factory(apiConfig, logger, dataManager, fullLog) {
        const obj = new ApiManager();
        obj.apiConfig = apiConfig;
        obj.logger = logger;
        obj.dataManager = dataManager;
        obj.fullLog = fullLog;

        return obj;
    }

    static parseApiDate(dateStr) {
        return new Date(moment(dateStr, "YYYY-MM-DDTHH:mm:ss [Z]").format('YYYY-MM-DD HH:mm:ss+00:00'));
    }

    async parseItemPage({
                            term,
                            page,
                            category,
                            date,
                            site
                        }, sort_by = 'updated', sort_direction = 'desc', page_size = 100) {
        const query = {
            term,
            page,
            page_size,
            category,
            site,
            date,
            sort_by,
            sort_direction
        };

        try {
            return await doApiRequest(this.apiConfig, itemApiPage, query);
        } catch (err) {
            this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
            return {};
        }
    }

    async parsePageAndStoreData({
                                    term,
                                    category,
                                    date,
                                    site,
                                    page
                                },
                                savingDate,
                                sort_by = 'updated',
                                sort_direction = 'desc',
                                page_size = 100
    ) {
        return this.parseItemPage({term, page, category, date, site}, sort_by, sort_direction, page_size).then(data => {
            this.logger.info(`Results : page = ${page}, term = ${term}, size = ${data?.matches?.length}`);

            return new Promise((resolve) => {
                this.logQuery({term, page, category, date, site, sort_by, sort_direction, page_size}, data).then(() => {
                    resolve(data);
                });
            }).catch(err => {
                this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
                return data;
            });

        }).then(data => {
            if (!data?.matches || !Array.isArray(data?.matches)) {
                return Promise.resolve(data);
            }

            return new Promise((resolve) => {
                data.matches = data.matches.filter(item => item?.id);

                data.matches.forEach((item) => {
                    item.tags = item.tags && Array.isArray(item.tags) ? JSON.stringify(item.tags) : null;

                    this.dataManager.models.Goods.addGoodIfNotExists(item).then(() => {
                        item.date = savingDate;
                        item.term = term ? term : null;
                        item.updated_at = item.updated_at ? ApiManager.parseApiDate(item.updated_at) : null;
                        item.published_at = item.published_at ? ApiManager.parseApiDate(item.published_at) : null;

                        if (!item?.date) {
                            return this.logger.warn('item.date is empty, item : ' + JSON.stringify(item));
                        }

                        return this.dataManager.models.GoodsSales.addItem(item);
                    }).then(() => {
                        resolve(data);
                    }).catch(err => {
                        this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
                    });

                });
            })
        });
    }

    async parseAllPages({
                            term,
                            category,
                            date,
                            site
                        },
                        savingDate,
                        sort_by = 'updated',
                        sort_direction = 'desc',
                        page_size = 100
    ) {
        return new Promise((resolve, reject) => {
            const parseHandler = (page) => {
                this.parsePageAndStoreData({
                    term,
                    page,
                    category,
                    site,
                    date
                }, savingDate, sort_by, sort_direction, page_size).then(data => {
                    if (data?.links?.next_page_url) {
                        page++;

                        return parseHandler(page);
                    }

                    resolve();

                }, rejectStatus => {
                    if (rejectStatus?.response?.status === 429 && rejectStatus?.response?.headers?.['Retry-After']) {
                        const waitTime = rejectStatus?.response?.headers?.['Retry-After'];
                        this.logger.warn(`429 response received, time : waitTime`);

                        //Wait no more than 3 hours
                        if (waitTime < 3 * 3600) {
                            setTimeout(waitTime * 1000, () => {
                                parseHandler(page);
                            });

                            return;
                        }

                        reject();
                    }
                }).catch(err => {
                    this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));

                    reject(err);
                });

            }

            parseHandler(1);
        });

    }

    async logQuery(params, response) {
        if (!this.fullLog) {
            return Promise.resolve();
        }

        const date = Helpers.getDateWithoutTimezone(false);
        params = JSON.stringify(params);
        response = JSON.stringify(response);
        await this.dataManager.models.ResponseLogger.addItem({params, response, date});
    }
}

module.exports.ApiManager = ApiManager;
