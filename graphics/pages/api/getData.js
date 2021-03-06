import {connect as dbConnection} from '/libs/dbConnection';
import moment from "moment";
import salesDiffs from "../../sql/salesDiffs";
import aggregates from "../../sql/aggregates";
import totalAggregates from "../../sql/totalAggregates";
import lastParsedDate from "../../sql/lastParsedDate";
import countUnique from "../../sql/countUnique";

const getChartData = async ({term, df, dt}) => {
    const dfTS = Math.round(df.getTime() / 1000);
    const dtTS = Math.round(dt.getTime() / 1000);

    const getStats = () => {
        return new Promise((resolve, reject) => {
            if (!term || !df || !dt) {
                return resolve({
                    response: false,
                    msg: 'not enough parameters'
                });
            }

            const normalizedDfTS = dfTS + 86400;

            dbConnection().then(connection => {
                connection.query(salesDiffs(), [dfTS, dtTS, term], function (errRows, resultRows) {
                    connection.query(aggregates(), [term, dfTS, dtTS], function (errAggregates, resultAggregates) {
                        connection.query(totalAggregates(), [term, dtTS], function (errLastDateAggregates, resultLastDateAggregates) {
                            connection.query(lastParsedDate(), function (errLastParsedDate, resultLastParsedDate) {
                                connection.query(countUnique(), [normalizedDfTS, dtTS, term, normalizedDfTS], function (errCountUnique, resultCountUnique) {
                                    if (errRows || errAggregates || errLastDateAggregates || errLastParsedDate || errCountUnique) {
                                        console.error(errRows, errAggregates, errLastDateAggregates, errLastParsedDate, errCountUnique);

                                        return reject({
                                            response: false,
                                            msg: 'error during query execute'
                                        });
                                    }

                                    resultAggregates?.forEach(item => {
                                        item.date = moment(item.date).utcOffset(0, true).toDate().getTime()
                                    });

                                    resultLastDateAggregates?.forEach(item => {
                                        item.date = moment(item.date).utcOffset(0, true).toDate().getTime()
                                    });

                                    resolve({
                                        rows: resultRows.map(item => {
                                            return {
                                                ...item,
                                                date: moment(item.date).utcOffset(0, true).toDate().getTime()
                                            }
                                        }),
                                        aggregates: resultAggregates,
                                        resultLastDateAggregates: resultLastDateAggregates?.[0],
                                        resultCountUnique: resultCountUnique?.[0],
                                        response: true,
                                        lastDate: moment(resultLastParsedDate?.[0]?.date).format('DD.MM.YYYY')
                                    });
                                });
                            });
                        });
                    });

                });
            });
        })
    }

    return getStats();
}

export default async function handler(req, res) {
    const filters = {
        term: req.query.term,
        df: req.query.df ? moment(req.query.df, 'DD.MM.YYYY', true) : null,
        dt: req.query.dt ? moment(req.query.dt, 'DD.MM.YYYY', true) : null,
    }

    //??.??. ???????????????????? D + 1, ???? ?????????????????? 1 ????????
    filters.df = filters.df.isValid() ? filters.df.utcOffset(0, true).hour(0).minute(0).second(0).millisecond(0).add(-1, 'day').toDate() : null;
    filters.dt = filters.dt.isValid() ? filters.dt.utcOffset(0, true).hour(0).minute(0).second(0).millisecond(0).toDate() : null;

    try {
        const data = await getChartData(filters);
        res.status(200).json(data);
    } catch (e) {
        console.error(e);
        return res.status(500).json({response: false});
    }

}
