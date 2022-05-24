const {Sequelize} = require('sequelize');

class DataManager {
    sequelize;
    models = {Goods: null, GoodsSales: null, GoodsAggregation: null};

    static async factory(dbConfig) {
        const obj = new DataManager();

        obj.sequelize = new Sequelize(dbConfig.database, dbConfig.user, dbConfig.password, {
            define: {
                collate: 'utf8mb4_unicode_ci',
                timestamps: false
            },
            host: dbConfig.host,
            dialect: dbConfig.dialect
        });

        await obj.sequelize.authenticate();
        await obj.initModels(obj.sequelize);

        return obj;
    }

    async initModels() {
        this.models.Goods = require('./models/Goods').Goods(this.sequelize);
        this.models.GoodsSales = require('./models/GoodsSales').GoodsSales(this.sequelize);
        this.models.GoodsAggregation = require('./models/GoodsAggregation').GoodsAggregation(this.sequelize);

        await this.models.Goods.sync();
        await this.models.GoodsSales.sync();
        await this.models.GoodsAggregation.sync();
    }
}

module.exports.DataManager = DataManager;
