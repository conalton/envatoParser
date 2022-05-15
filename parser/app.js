const config = require('./config');

if (!config) {
    console.log('Config.json is empty or not found');
    process.exit(1);
}

if (!config?.api.token) {
    console.log('Api token not present in config');
    process.exit(1);
}

const {DataManager} = require('./dataManager');
const {doApiRequest} = require('./request');

DataManager.init(config.database).then((connection) => {
    const doParse = async (date, term) => {
        var isFirst = true;

        const call = (page, term) => {
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

                        /**
                         * generate random
                         */
                        //item.number_of_sales += 60 + Math.round(Math.random() * 10);

                        await DataManager.addItem(item);
                    });
                }

                if (isFirst && data?.aggregations?.cost) {
                    isFirst = false;

                    const aggregates = {};
                    Object.keys(data.aggregations.cost).forEach(key => {
                        aggregates['cost_' + key] = data.aggregations.cost[key];
                    })

                    DataManager.addAggregate({...aggregates, date, term})
                }

                if (data?.links?.next_page_url) {
                    page++;
                    console.log(`term :${term}, perfroming page: ${page}`);

                    return call(page, term);
                }

            }, rejectStatus => {
                console.log(`term :${term}, perfroming page failed: ${page}`);

                if (rejectStatus?.response?.status === 429 && rejectStatus?.response?.headers?.['Retry-After']) {
                    const waitTime = rejectStatus?.response?.headers?.['Retry-After'];
                    //не более 3 часов
                    if (waitTime < 3 * 3600) {
                        setTimeout(waitTime * 1000, () => {
                            call(page, term);
                        });

                        return;
                    }
                }
            });

        }

        call(1, term);
    }

    if (Array.isArray(config.terms)) {
        //const date = new Date('2022-05-09T00:00:00');
        const date = (new Date()).setHours(0, 0, 0);

        config.terms.forEach(async (term) => {
            await doParse(date, term);
        });
    }
});




