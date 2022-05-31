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
    const logQueries = config.logQueries !== '0';
    console.log(`log queries : ${config.logQueries}`);
    const ApiManager = require('./ApiManager').ApiManager.factory(
        config.api,
        logger,
        DataManager,
        logQueries,
        config.parserSettings
    );

    const parseHandler = () => {
        logger.info('Start parsing...');
        const savingDate = Helpers.getDateWithoutTimezone();

        Promise.all(config.terms.map((term) => {
            return ApiManager.parseAllPages({term, category: config.category, date : undefined, site: config.site}, savingDate);
        })).then(() => {
            logger.info(`End parsing`);
        })
    }

    setInterval(() => {
        parseHandler();
    }, 86400000);

    parseHandler();

}).catch(err => {
    logger.error(JSON.stringify(err, Object.getOwnPropertyNames(err)));
});

