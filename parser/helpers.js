const moment = require('moment');

const getDateWithoutTimezone = (zeroHours = true) => {
    const format = zeroHours ? 'YYYY-MM-DD 00:00:00+00:00' : 'YYYY-MM-DD HH:mm:ss+00:00';
    return new Date(moment(new Date()).utcOffset(0, true).format(format));
}

module.exports.getDateWithoutTimezone = getDateWithoutTimezone;
