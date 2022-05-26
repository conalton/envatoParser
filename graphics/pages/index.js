import dynamic from 'next/dynamic';
import React, {useState, useEffect, useRef} from 'react';
import axios from "axios";
import moment from "moment";

const TermsSelectorBlock = dynamic(() => import('../components/TermsSelector'));
const PeriodFilter = dynamic(() => import('../components/PeriodFilter'));
const MainDailyGraph = dynamic(() => import('../components/MainDailyGraph'));
const AggregationsGraph = dynamic(() => import('../components/AggregationsGraph'));

const styles = {
    main: {
        display: "flex",
        flexBasis: "100%",
        padding: '15px 25px'
    },
    leftPanel: {
        flexBasis: '20%'
    },
    mb2: {
        marginBottom: '1.5rem'
    }
}


export default function Index() {
    const [dailyData, setDailyData] = useState();
    const [aggregationsData, setAggregationsData] = useState();

    const startDate = new Date(),
        endDate = new Date();

    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);
    startDate.setDate(endDate.getDate() - 1);

    const [filters, setFilters] = useState({term: null, df: startDate, dt: endDate});

    const [aggregates, setAggregates] = useState({
        sum: 0,
        countGoods: 0
    });

    useEffect(() => {
        ReloadGraph()
    }, [filters]);

    const ReloadGraph = () => {
        axios.get('/api/getData', {
            params: {
                ...filters,
                df: filters.df ? moment(filters.df).format('DD.MM.YYYY') : undefined,
                dt: filters.dt ? moment(filters.dt).format('DD.MM.YYYY') : undefined
            },
        }).then(response => {
            if (!response?.data?.response) {
                return setDailyData(null);
            }

            prepareAggregtesTotal(response?.data?.aggregates);

            setAggregationsData(response?.data?.aggregates);

            if (Array.isArray(response?.data?.rows)) {
                setDailyData(response?.data?.rows);
            }

        }, rejectData => {
            setDailyData(null);
            prepareAggregtesTotal({});
            setAggregationsData({});
        }).catch(() => {
            setDailyData(null);
            prepareAggregtesTotal({});
            setAggregationsData({});
        });
    }

    const onChooseTerm = (value) => {
        setFilters({
            ...filters,
            term: value?.id
        });
    }

    const prepareAggregtesTotal = (data) => {
        const newState = {
            sum: data.length ? data.map(item => item.cost_sum).reduce((a, b) => a + b) : '--',
            countGoods: data.length ? data.map(item => item.cost_count).reduce((a, b) => a + b) : '--',
            cost_count_delta: data[data.length - 1]?.cost_count_delta,
            cost_sum_delta: data[data.length - 1]?.cost_sum_delta,
        }

        setAggregates(newState);
    }

    const onChangeDf = (date) => {
        setFilters({
            ...filters,
            df: new Date(date.getTime())
        });
    }

    const onChangeDt = (date) => {
        setFilters({
            ...filters,
            dt: new Date(date.getTime())
        });
    }

    const RenderOneDayStats = () => {
        if (!filters.df || !filters.dt || !filters.term
            || (filters.dt.getTime() - filters.df.getTime() > 86400000)) {
            return <div/>;
        }

        return <div>
            <div style={styles.mb2}>
                Прирост товаров за день:
                <div>
                    {aggregates?.cost_count_delta !== null && aggregates?.cost_count_delta !== undefined  ? aggregates.cost_count_delta : '--'}
                </div>
            </div>

            <div style={styles.mb2}>
                Прирост выручки за день:
                <div>
                    {aggregates?.cost_sum_delta !== null && aggregates?.cost_sum_delta !== undefined  ? aggregates.cost_sum_delta : '--'} $
                </div>
            </div>
        </div>

    }

    return (
        <div style={styles.main}>
            <div style={styles.leftPanel}>
                <div style={styles.mb2}>
                    <TermsSelectorBlock onChange={onChooseTerm}/>
                </div>

                <div style={styles.mb2}>
                    <PeriodFilter
                        onChangeDf={onChangeDf}
                        onChangeDt={onChangeDt}
                        df={filters.df}
                        dt={filters.dt}
                    />
                </div>

                <div style={styles.mb2}>
                    Выручка:
                    <div>
                        {aggregates.sum} $
                    </div>
                </div>

                <div style={styles.mb2}>
                    Количество товаров:
                    <div>
                        {aggregates.countGoods}
                    </div>
                </div>

                <RenderOneDayStats/>

            </div>

            <div style={{display: 'flex', flexDirection: 'column', flexBasis: '70%'}}>
                <div style={styles.mb2}>
                    <MainDailyGraph rows={dailyData}/>
                </div>
                <AggregationsGraph rows={aggregationsData}/>
            </div>


        </div>
    )
}
