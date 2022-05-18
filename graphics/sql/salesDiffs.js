const getSqlDiff = () => {
    return ` WITH recursive periodRanges AS (
    select DATE(FROM_UNIXTIME(?) + interval 1 day) as DATE FROM dual
   union all
   select DATE(Date + interval 1 day)
   from periodRanges
   where DATE < (select DATE(FROM_UNIXTIME(?)) as DATE FROM dual))
   
    select periodRanges.date,  goods.name, goods.id,
    
    sales.number_of_sales - IFNULL((
    SELECT subsales.number_of_sales FROM goods_sales subsales
     WHERE subsales.date = sales.date - interval 1 day
     AND subsales.good_id = sales.good_id
     AND subsales.term = sales.term
      ORDER BY sales.date DESC LIMIT 1), sales.number_of_sales) AS number_of_sales_inc,
     
    sales.number_of_sales
    
    from periodRanges
    LEFT JOIN goods_sales sales ON sales.date = periodRanges.date and sales.term = ?
    LEFT JOIN goods ON goods.id = sales.good_id
    
    ORDER BY periodRanges.date, goods.name `;
}

export default getSqlDiff;
