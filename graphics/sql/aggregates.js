export default () => {
    return `

SELECT 

currentDay.date,

sum(ifnull(currentDay.price_cents * currentDay.number_of_sales - prevDay.price_cents * prevDay.number_of_sales, 0) / 100) AS cost_sum_delta,
sum(ifnull(currentDay.number_of_sales - prevDay.number_of_sales, 0))  AS cost_count_delta

FROM
goods_sales currentDay
LEFT JOIN goods_sales prevDay ON prevDay.good_id = currentDay.good_id
AND prevDay.term = currentDay.term
AND prevDay.date = currentDay.date - interval 1 day

WHERE currentDay.term = ?
AND currentDay.date >= DATE(FROM_UNIXTIME(?))
AND currentDay.date <= DATE(FROM_UNIXTIME(?))

GROUP BY currentDay.date
ORDER BY currentDay.date

`
}
