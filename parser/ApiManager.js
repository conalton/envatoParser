const moment = require('moment');
const {doApiRequest} = require('./request');

const itemApiPage = '/discovery/search/search/item';
const AggregatesKeys = ['avg', 'count', 'max', 'min', 'sum'];

class ApiManager {
    apiConfig;
    logger;
    dataManager;

    static factory(apiConfig, logger, dataManager) {
        const obj = new ApiManager();
        obj.apiConfig = apiConfig;
        obj.logger = logger;
        obj.dataManager = dataManager;

        return obj;
    }

    static parseApiDate(dateStr) {
        return new Date(moment(dateStr, "YYYY-MM-DDTHH:mm:ss [Z]").format('YYYY-MM-DD HH:mm:ss+00:00'));
    }

    async parseItemPage({term, page, category, date}, sort_by = 'updated', sort_direction = 'desc', page_size = 100) {
        const query = {
            term,
            page,
            page_size,
            category,
            date,
            sort_by,
            sort_direction
        };

        return doApiRequest(this.apiConfig, itemApiPage, query);
    }

    async parsePageAndStoreData({
                                    term,
                                    category,
                                    date,
                                    page
                                }, sort_by = 'updated', sort_direction = 'desc', page_size = 100) {
        return this.parseItemPage({term, page, category, date}, sort_by, sort_direction, page_size).then(data => {
            this.logger.info(`Results : page = ${page}, term = ${term}, size = ${data?.matches?.length}`);

            if (data?.matches && Array.isArray(data?.matches)) {
                data.matches = data.matches.filter(item => item?.id);

                data.matches.forEach(async (item) => {
                    item.tags = item.tags && Array.isArray(item.tags) ? JSON.stringify(item.tags) : null;

                    await this.dataManager.models.Goods.addGoodIfNotExists(item);

                    item.date = ApiManager.parseApiDate(item?.published_at);
                    item?.date?.setHours(0, 0, 0, 0);
                    item.term = term ? term : null;
                    item.updated_at = item.updated_at ? ApiManager.parseApiDate(item.updated_at) : null;

                    if (!item?.date) {
                        return this.logger.warn('item.date is empty, item : ' + JSON.stringify(item));
                    }

                    await this.dataManager.models.GoodsSales.addItem(item);
                });
            }

            return data;
        });
    }

    async parseAllPages({term, category, date}, sort_by = 'updated', sort_direction = 'desc', page_size = 100) {
        return new Promise((resolve) => {
            const parseHandler = (page) => {
                this.parsePageAndStoreData({
                    term,
                    page,
                    category,
                    date
                }, sort_by, sort_direction, page_size).then(data => {
                    if (data?.links?.next_page_url) {
                        page++;

                        return parseHandler();
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

                        }
                    }
                }).catch(err => {
                    this.logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
                });

            }

            parseHandler(1);
        });

    }

    async parseAggregatesAndSaveData({term, category, date}) {
        const page = 1;
        return this.parseItemPage({term, page, category, date}).then(data => {
            this.logger.info(`Results aggregates : page = ${page}, term = ${term}`);

            const aggregates = {};
            AggregatesKeys.forEach(key => {
                aggregates['cost_' + key] = data.aggregations.cost[key] !== undefined
                && data.aggregations.cost[key] !== null ? data.aggregations.cost[key] : 0;
            });

            const saveDate = new Date(moment(new Date()).utcOffset(0, true).format('YYYY-MM-DD 00:00:00+00:00'))

            return this.dataManager.models.GoodsAggregation.addAggregate({...aggregates, date: saveDate, term})
        });
    }
}

module.exports.ApiManager = ApiManager;
