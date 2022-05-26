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
const Helpers = require('./helpers');

DataManagerFactory.then(DataManager => {
    return new Promise((resolve) => {
        DataManager.models.GoodsSales.findOne().then(coldStart => {
            resolve({coldStart, DataManager});
        });
    });
}).then(({coldStart, DataManager}) => {
    coldStart  = true;
    const logQueries = config.logQueries !== '0';
    console.log(`log queries : ${config.logQueries}`);
    const ApiManager = require('./ApiManager').ApiManager.factory(
        config.api,
        logger,
        DataManager,
        logQueries
    );

    logger.info('Start parsing...');
    const date = coldStart ? 'this-day' : undefined;
    const savingDate = Helpers.getDateWithoutTimezone();

    config.terms.map((term) => {
        return ApiManager.parseAllPages({term, category: config.category, date, site: config.site}, savingDate);
    }).then(() => {
        logger.info(`End parsing`);
    });

}).catch(err => {
    logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});

