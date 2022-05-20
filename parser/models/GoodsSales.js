const {Goods} = require('./Goods');
const {DataTypes, Model} = require('sequelize');

/**
 * Daily data and history of good's sales
 */
class GoodsSales extends Model {
}

const init = (sequelize) => {
    GoodsSales.init({
        id: {
            primaryKey: true,
            type: DataTypes.BIGINT,
            autoIncrement: true,
        },
        good_id: {
            type: DataTypes.BIGINT,
            unique: 'goods_sales_unique',
            references: {
                model: Goods,
                key: 'id'
            }
        },
        date: {
            type: DataTypes.DATE,
            unique: 'goods_sales_unique'
        },
        updated_at : {
            type: DataTypes.DATE,
        },

        price_cents: {
            type: DataTypes.DOUBLE(18, 2)
        },
        number_of_sales: {
            type: DataTypes.INTEGER,
        },
        term: {
            type: DataTypes.STRING(50),
            unique: 'goods_sales_unique'
        },
        url: {
            type: DataTypes.STRING(500)
        }
    }, {
        tableName: 'goods_sales',
        sequelize,
        timestamps: false
    });
}

module.exports.default = {GoodsSales};

module.exports.init = (sequelize) => {
    init(sequelize);
};

module.exports.GoodsSales = GoodsSales;
