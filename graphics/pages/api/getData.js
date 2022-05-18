import {connect as dbConnection} from '/libs/dbConnection';
import moment from "moment";
import salesDiffs from "/sql/salesDiffs";
import aggregates from "../../sql/aggregates";

const getChartData = async ({term, df, dt}) => {
    const dfTS = Math.round(df.getTime() / 1000);
    const dtTS = Math.round(dt.getTime() / 1000);

    const getStats = () => {
        return new Promise((resolve, reject) => {
            dbConnection().then(connection => {
                connection.query(salesDiffs(), [dfTS, dtTS, term], function (errRows, resultRows) {

                    connection.query(aggregates(), [dfTS, dtTS, term], function (errAggregates, resultAggregates) {
                        if (errRows || errAggregates) {
                            return reject({
                                response: false,
                                msg: 'error during query execute'
                            });
                        }

                        resultAggregates?.forEach(item => {
                            item.date = moment(item.date).utcOffset(0, true).toDate().getTime()
                        })

                        resolve({
                            rows: resultRows.map(item => {
                                return {...item, date : moment(item.date).utcOffset(0, true).toDate().getTime()}
                            }),
                            aggregates: resultAggregates,
                            response: true
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

    //т.к. статистика D + 1, то добавляет 1 день
    filters.df = filters.df.isValid() ? filters.df.utcOffset(0, true).hour(0).minute(0).second(0).millisecond(0).add(-1, 'day').toDate() : null;
    filters.dt = filters.dt.isValid() ? filters.dt.utcOffset(0, true).hour(0).minute(0).second(0).millisecond(0).toDate() : null;

    const data = await getChartData(filters);
    res.status(200).json(data);
}
