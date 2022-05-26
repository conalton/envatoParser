const aggregates = () => {
    return `

WITH recursive periodRanges AS (
    select DATE(FROM_UNIXTIME(?) + interval 1 day) as DATE FROM dual
   union all
   select DATE(Date + interval 1 day)
   from periodRanges
   where DATE < (select DATE(FROM_UNIXTIME(?)) as DATE FROM dual))
    select periodRanges.date, 
    ifnull(aggregation_data.cost_count, 0) as cost_count, 
    ifnull(aggregation_data.cost_sum, 0) / 100 as cost_sum,
    
    ifnull(aggregation_data.cost_count, 0) 
    - ifnull((select prev.cost_count 
    from goods_aggregation prev
     where 
     prev.date = aggregation_data.date - interval 1 day
     and prev.term = aggregation_data.term order by prev.date desc limit 1
      ), ifnull(aggregation_data.cost_count, 0)) as cost_count_delta,
      
          (ifnull(aggregation_data.cost_sum, 0) 
    - ifnull((select prev.cost_sum 
    from goods_aggregation prev
     where 
     prev.date = aggregation_data.date - interval 1 day
     and prev.term = aggregation_data.term order by prev.date desc limit 1
      ), ifnull(aggregation_data.cost_sum, 0) )) / 100 as cost_sum_delta
    
    from periodRanges
    left join goods_aggregation aggregation_data on aggregation_data.date = periodRanges.date
    and aggregation_data.term = ?
    
    order by periodRanges.date asc
`;
}

export default aggregates;
