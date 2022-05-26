const {DataTypes, Model, NOW} = require('sequelize');

/**
 * ResponseLogger - API response logger
 */
class ResponseLogger extends Model {
    static async addItem(item) {
        await ResponseLogger.create(item);
    }
}

const define = (sequelize) => {
    if (sequelize.models.ResponseLogger) {
        return ResponseLogger;
    }

    ResponseLogger.init({
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true
        },
        date: {
            type: DataTypes.DATE,
            defaultValue: NOW
        },
        params: {
            type: DataTypes.TEXT('long'),
        },
        response: {
            type: DataTypes.TEXT('long'),
        }
    }, {
        tableName: 'responseLogger',
        sequelize,
        timestamps: false
    });

    return ResponseLogger;
}

module.exports.ResponseLogger = define;
