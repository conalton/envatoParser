const {Sequelize} = require('sequelize');
const {Goods, init: initGoods} = require('./models/Goods');
const {GoodsSales, init: initGoodsSales} = require('./models/GoodsSales');
const {GoodsAggregation, init: initGoodsAggregation} = require('./models/GoodsAggregation');

const initModels = async (sequelize) => {
    initGoods(sequelize);
    initGoodsSales(sequelize);
    initGoodsAggregation(sequelize);

    await Goods.sync();
    await GoodsSales.sync();
    await GoodsAggregation.sync();
}

const init = async (dbConfig) => {
    const sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
        define: {
            collate: 'utf8mb4_unicode_ci',
            timestamps: false
        },
        host: dbConfig.host,
        dialect: dbConfig.dialect
    });

    await sequelize.authenticate();
    await initModels(sequelize);
}

const DataManager = {
    async init(dbConfig) {
        await init(dbConfig);
    },

    async addItem({id, date, price_cents, number_of_sales, term, url, updated_at}) {
        await GoodsSales.findOrCreate({
            where: {
                good_id : id,
                date,
                term
            },
            defaults: {good_id : id, date, price_cents, number_of_sales, term, url, updated_at}
        });
    },

    async addGoodIfNotExists({id, name, summary, tags}) {
        await Goods.findOrCreate({
            where: {
                id
            },
            defaults: {name, summary, tags, id}
        });
    },

    async addAggregate({date, cost_avg, cost_count, cost_max, cost_min, cost_sum, term}) {
        await GoodsAggregation.findOrCreate({
            where: {
                date,
                term
            },
            defaults: {date, cost_avg, cost_count, cost_max, cost_min, cost_sum, term}
        });
    }
}

module.exports = {DataManager};
