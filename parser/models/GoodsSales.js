const {DataTypes, Model} = require('sequelize');

/**
 * Daily data and history of good's sales
 */
class GoodsSales extends Model {
    static async addItem({
                             id,
                             date,
                             price_cents,
                             number_of_sales,
                             term,
                             url,
                             updated_at,
                             published_at,
                             author_username,
                             author_url
                         }) {
        await GoodsSales.findOrCreate({
            where: {
                good_id: id,
                date,
                term
            },
            defaults: {
                good_id: id,
                date,
                price_cents,
                number_of_sales,
                term,
                url,
                updated_at,
                published_at,
                author_username,
                author_url
            }
        });
    }
}

const define = (sequelize) => {
    if (sequelize.models.GoodsSales) {
        return GoodsSales;
    }

    GoodsSales.init({
        id: {
            primaryKey: true,
            type: DataTypes.BIGINT,
            autoIncrement: true,
        },
        good_id: {
            type: DataTypes.BIGINT,
            unique: 'goods_sales_unique',
        },
        date: {
            type: DataTypes.DATE,
            unique: 'goods_sales_unique'
        },
        updated_at: {
            type: DataTypes.DATE,
        },
        published_at: {
            type: DataTypes.DATE,
        },
        price_cents: {
            type: DataTypes.INTEGER
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
        },
        author_username: {
            type: DataTypes.STRING(500)
        },
        author_url: {
            type: DataTypes.STRING(500)
        }
    }, {
        tableName: 'goods_sales',
        sequelize,
        timestamps: false,
        indexes:[
            {
                unique: false,
                fields:['good_id']
            },
            {
                unique: false,
                fields:['date']
            },
            {
                unique: false,
                fields:['term']
            },
        ]
    });

    return GoodsSales;
}

module.exports.GoodsSales = define;
