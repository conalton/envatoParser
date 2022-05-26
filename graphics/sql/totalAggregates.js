export default () => {
    return `
        select
        
    sum(ifnull(price_cents * number_of_sales, 0) / 100) as sum,
    sum(number_of_sales) as count
    
    from goods_sales
    
    where goods_sales.term = ? and goods_sales.date = (select sales.date from goods_sales sales 
    where sales.date <= DATE(FROM_UNIXTIME(?)) order by sales.date desc limit 1 )
    `;
}
