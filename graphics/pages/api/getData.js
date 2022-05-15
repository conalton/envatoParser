import {connect as dbConnection} from '/libs/dbConnection';

const sqlDiff = ` WITH recursive periodRanges AS (
    select MIN(DATE) as DATE FROM goods_sales
   union all
   select Date + interval 1 day
   from periodRanges
   where DATE < (select max(DATE) as DATE FROM goods_sales))
   
   
select periodRanges.date,  goods.name, goods.id,

sales.number_of_sales - IFNULL((
SELECT subsales.number_of_sales FROM goods_sales subsales
 WHERE subsales.date = sales.date - interval 1 day
 AND subsales.good_id = sales.good_id
 AND subsales.term = sales.term
  ORDER BY sales.date DESC LIMIT 1), 0) AS number_of_sales_inc,
  
  
sales.number_of_sales

from periodRanges
JOIN goods_sales sales ON sales.date = periodRanges.date 
JOIN goods ON goods.id = sales.good_id

WHERE EXISTS (
SELECT subsales.number_of_sales FROM goods_sales subsales
 WHERE subsales.date < sales.date
 AND subsales.good_id = sales.good_id
 AND subsales.term = sales.term)
 AND sales.term = ?

ORDER BY periodRanges.date `;

const sqlAggregates = `SELECT SUM(cost_count) as count, sum (cost_sum) as sum FROM goods_aggregation
WHERE term = ? and UNIX_TIMESTAMP(date) >= ? and UNIX_TIMESTAMP(date) <= ? `;

const getChartData = async (term) => {
    return new Promise((resolve, reject) => {
        dbConnection().then(connection => {

            connection.query(sqlDiff, [term], function (err, result) {
                if (err) {
                    return reject({});
                }

                if (Array.isArray(result) && result.length) {
                    const uniqueGoods = new Map();

                    result.forEach(item => {
                        uniqueGoods.set(item.id, item.name);
                        item.date = item.date.getTime();
                    })

                    const dates = Array.from(new Set(Array.from(result.map(item => item.date))));
                    const minDate = Math.round(Math.min.apply(null, dates) / 1000);
                    const maxDate = Math.round(Math.max.apply(null, dates) / 1000);

                    connection.query(sqlAggregates, [term, minDate, maxDate], function (err1, result1) {
                        if (err1 || !result1.length) {
                            return resolve({
                                minDate, maxDate, dates
                            });
                        }

                        const rows = [];

                        rows.push(['Дата', ...Array.from(uniqueGoods.values())]);

                        dates.forEach(date => {
                            rows.push([date, ...result.filter(item => item.date === date).map(item => item.number_of_sales_inc)])
                        });

                        resolve({
                            rows,
                            aggregates: result1[0]
                        });
                    });

                    return;
                }

                resolve({});
            });
        }, () => {
            reject({});
        }).catch(() => {
            reject({});
        })
    });
}

export default async function handler(req, res) {
    const data = await getChartData(req.query.term);
    res.status(200).json(data);
}
