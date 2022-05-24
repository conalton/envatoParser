const {DataTypes, Model} = require('sequelize');

/**
 * Daily aggregation data
 */
class GoodsAggregation extends Model {
    static async addAggregate({date, cost_avg, cost_count, cost_max, cost_min, cost_sum, term}) {
        await GoodsAggregation.findOrCreate({
            where: {
                date,
                term
            },
            defaults: {date, cost_avg, cost_count, cost_max, cost_min, cost_sum, term}
        });
    }
}

const define = (sequelize) => {
    if (sequelize.models.GoodsAggregation) {
        return GoodsAggregation;
    }

    GoodsAggregation.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATE,
            unique: 'goods_aggregation_unique',
        },
        cost_avg: {
            type: DataTypes.DOUBLE(18, 2)
        },
        cost_count: {
            type: DataTypes.INTEGER
        },
        cost_max: {
            type: DataTypes.DOUBLE(18, 2)
        },
        cost_min: {
            type: DataTypes.DOUBLE(18, 2)
        },
        cost_sum: {
            type: DataTypes.DOUBLE(18, 2)
        },
        term: {
            type: DataTypes.STRING(50),
            unique: 'goods_aggregation_unique',
        },
    }, {
        tableName: 'goods_aggregation',
        sequelize,
        timestamps: false
    });

    return GoodsAggregation;
}

module.exports.GoodsAggregation = define;
