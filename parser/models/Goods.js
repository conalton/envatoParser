const {DataTypes, Model} = require('sequelize');

/**
 * Goods - unique goods in API
 */
class Goods extends Model{
    static async addGoodIfNotExists({id, name, summary, tags}) {
        await this.findOrCreate({
            where: {
                id
            },
            defaults: {name, summary, tags, id}
        });
    }
}

const define = (sequelize) => {
    if (sequelize.models.Goods) {
        return Goods;
    }

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
        sequelize,
        timestamps: false
    });

    return Goods;
}

module.exports.Goods = define;
