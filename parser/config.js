const getConfig = () => {
    try {
        const configReader = require('fs');
        const configString = configReader.readFileSync('./config.json', {encoding: 'utf8', flag: 'r'});
        return JSON.parse(configString);

    } catch (e) {
    }

    return null;
}

module.exports = getConfig();
