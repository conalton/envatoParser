export default () => {
    return `
    SELECT count(sales.good_id) AS countUnique FROM
goods_sales sales
WHERE sales.date >= DATE(FROM_UNIXTIME(?)) AND sales.date <= DATE(FROM_UNIXTIME(?))
and sales.term = ?
AND NOT EXISTS (SELECT 1 
FROM goods_sales prev_sales 
WHERE prev_sales.term = sales.term 
AND prev_sales.good_id = sales.good_id AND prev_sales.date < DATE(FROM_UNIXTIME(?)))
`
}
