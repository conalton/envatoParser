const { DataTypes, Model } = require('sequelize');

/**
 * Daily aggregation data
 */
class GoodsAggregation extends Model {
}

const init = (sequelize) => {
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
        cost_count : {
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
        sequelize : sequelize,
        timestamps: false
    });
}

module.exports.default = GoodsAggregation;

module.exports.init = (sequelize) => {
    init(sequelize);
};

module.exports.GoodsAggregation = GoodsAggregation;
