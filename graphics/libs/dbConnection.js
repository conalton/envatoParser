import mysql from 'mysql';
import config from "./config";

const connect = () => {
    return new Promise((resolve, reject) => {
        const connection = mysql.createConnection({
            host: config.database.host,
            user: config.database.user,
            database: config.database.database,
            password: config.database.password
        });

        connection.connect(function (err) {
            if (err) {
                return reject(err);
            }

            resolve(connection);
        });
    })
}


export {connect};
