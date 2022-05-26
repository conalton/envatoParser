export default () => {
    return `
        select
        
    sum(ifnull(price_cents * number_of_sales, 0) / 100) as sum,
    sum(number_of_sales) as count
    
    from goods_sales
    
    where goods_sales.term = ? and DATE(FROM_UNIXTIME(?)) = goods_sales.date
    `;
}
