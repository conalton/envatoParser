export default () => {
    return `
        select
        
    sum(ifnull(stats.price_cents * stats.number_of_sales, 0) / 100) as sum,
    sum(stats.number_of_sales) as count,
    
    (select count(good_id) from goods_sales subStat where stats.term = subStat.term and stats.date = subStat.date ) as uniqueGoods
    
    from goods_sales stats
    
    where stats.term = ? and stats.date = (select sales.date from goods_sales sales 
    where sales.date <= DATE(FROM_UNIXTIME(?)) order by sales.date desc limit 1 )
    `;
}
