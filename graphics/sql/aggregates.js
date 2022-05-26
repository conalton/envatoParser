export default () => {
    return `

WITH recursive periodRanges AS (
    select DATE(FROM_UNIXTIME(?)) as DATE FROM dual
   union all
   select DATE(Date + interval 1 day)
   from periodRanges
   where DATE < (select DATE(FROM_UNIXTIME(?)) as DATE FROM dual))
    select periodRanges.date,
    sum(
    (
    case when
    (
    ifnull(currentStats.price_cents * currentStats.number_of_sales, 0) -
    ifnull(prevDayStats.price_cents * prevDayStats.number_of_sales, ifnull(currentStats.price_cents * currentStats.number_of_sales, 0))
    ) < 0 then 0
    else 
     (
    ifnull(currentStats.price_cents * currentStats.number_of_sales, 0) -
    ifnull(prevDayStats.price_cents * prevDayStats.number_of_sales, ifnull(currentStats.price_cents * currentStats.number_of_sales, 0))
    ) end
    ) / 100
    
   ) as cost_sum_delta,
     
     sum(
     case when
    ifnull(currentStats.number_of_sales, 0) -
    ifnull(prevDayStats.number_of_sales, ifnull(currentStats.number_of_sales, 0)) < 0 then 0 
    else 
    ifnull(currentStats.number_of_sales, 0) -
    ifnull(prevDayStats.number_of_sales, ifnull(currentStats.number_of_sales, 0))
    end
    )
    as cost_count_delta
    
    from periodRanges
    left join goods_sales currentStats on currentStats.date = periodRanges.date
    left join goods_sales prevDayStats on prevDayStats.date = currentStats.date - interval 1 day
    and prevDayStats.term = currentStats.term

    where ifnull(currentStats.term, ? ) = ?
    group by periodRanges.date
    order by periodRanges.date asc
`
}
