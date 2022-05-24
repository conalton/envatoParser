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

if (!Array.isArray(config.terms)) {
    logger.fatal('config.terms is not array');
    return;
}

const DataManagerFactory = require('./DataManager').DataManager.factory(config.database);

DataManagerFactory.then(DataManager => {
    return new Promise((resolve) => {
        DataManager.models.GoodsSales.findOne().then(coldStart => {
            resolve({coldStart, DataManager});
        });
    });
}).then(({coldStart, DataManager}) => {
    const ApiManager = require('./ApiManager').ApiManager.factory(config.api, logger, DataManager);

    logger.info('Start parsing...');
    const date = coldStart ? 'this-day' : undefined;

    Promise.all(config.terms.map((term) => {
        return ApiManager.parseAllPages({term, category: config.category, date});
    }).concat(
        config.terms.map(term => {
            return ApiManager.parseAggregatesAndSaveData({term, category: config.category, date});
        })
    )).then(() => {
        logger.info(`End parsing`);
    });

}).catch(err => {
    logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});

//wait until next restart
const waitMinutes = process.env.PARSING_MIN_INTERVAL || 15;

setTimeout(() => {
    console.log('restart delay');
}, waitMinutes * 60 * 1000);

