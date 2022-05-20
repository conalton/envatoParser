const { DataTypes, Model } = require('sequelize');

/**
 * Goods - unique goods in API
 */
class Goods extends Model {
}

const init = (sequelize) => {
    Goods.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: false,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(500),
        },
        summary: {
            type: DataTypes.STRING(500),
        },
        tags: {
            type: DataTypes.TEXT('medium'),
        },
    }, {
        tableName: 'goods',
        sequelize : sequelize,
        timestamps: false
    });
}

module.exports.default = Goods;

module.exports.init = (sequelize) => {
    init(sequelize);
};

module.exports.Goods = Goods;
