import {connect as dbConnection} from './dbConnection';

const getTerms = async () => {
    return new Promise((resolve, reject) => {
        dbConnection().then(connection => {
            connection.query('select distinct term from goods_sales', function (err, result) {
                if (err) {
                    return reject();
                }

                if (Array.isArray(result)) {
                    resolve(result.map(item => item.term));
                }

                resolve([]);
            });
        }, () => {
            reject();
        }).catch(() => {
            reject();
        })
    });
}

export {getTerms}
