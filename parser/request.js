const axios = require('axios');

const doApiRequest = (config, method, params = {}) => {
    return new Promise((resolve, reject) => {
        axios.get(config.url + method, {
            params,
            headers: {
                Authorization: `Bearer ${config.token}`
            }
        }).then(response => {
            resolve(response.data);

        }, rejectError => {
            reject(rejectError);

        }).catch(e => {
            reject(e);
        });
    });
}

module.exports = {doApiRequest};
