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

    const [aggregatesDelta, setAggregatesDelta] = useState({
        sum: 0,
        countGoods: 0,
        uniqueGoods: 0
    });

    const [lastParsedDate, setLastParsedDate] = useState('--');

    const [aggregatesPeriod, setAggregatesPeriod] = useState({
        sum: 0,
        count: 0,
        countUnique: 0
    })

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

            prepareAggregtesDelta(response?.data?.resultLastDateAggregates);

            setAggregationsData(response?.data?.aggregates);

            preparePeriodAggregatesData(response?.data?.aggregates, response?.data?.resultCountUnique);

            if (Array.isArray(response?.data?.rows)) {
                setDailyData(response?.data?.rows);
            }

            setLastParsedDate(response?.data?.lastDate);

        }, rejectData => {
            setDailyData(null);
            prepareAggregtesDelta({});
            setAggregationsData({});
            preparePeriodAggregatesData(null);
        }).catch(() => {
            setDailyData(null);
            prepareAggregtesDelta({});
            setAggregationsData({});
            preparePeriodAggregatesData(null);
        });
    }

    const onChooseTerm = (value) => {
        setFilters({
            ...filters,
            term: value?.id
        });
    }

    const prepareAggregtesDelta = (data) => {
        const newState = {
            sum: data.sum,
            count: data.count,
            uniqueGoods: data.uniqueGoods
        }

        setAggregatesDelta(newState);
    }

    const preparePeriodAggregatesData = (data, uniqueData) => {

        const newState = {
            sum: data?.map(item => item.cost_sum_delta).reduce((a, b) => a + b),
            count: data?.map(item => item.cost_count_delta).reduce((a, b) => a + b),
            countUnique: uniqueData?.countUnique
        }

        setAggregatesPeriod(newState);
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

    const RenderPeriodStats = () => {
        if (!filters.df || !filters.dt || !filters.term) {
            return <div/>;
        }

        return <div>
            <div style={styles.mb2}>
                ?????????? ???????????????????? ?????????????? ???? ????????????:
                <div>
                    {aggregatesPeriod?.countUnique >= 0 ? aggregatesPeriod?.countUnique : '--'}
                </div>
            </div>

            <div style={styles.mb2}>
                ?????????????? ???????????? ???? ????????????:
                <div>
                    {aggregatesPeriod?.count >= 0 ? aggregatesPeriod?.count : '--'}
                </div>
            </div>

            <div style={styles.mb2}>
                ?????????????? GMV ???? ????????????:
                <div>
                    {aggregatesPeriod?.sum >= 0 ? aggregatesPeriod.sum : '--'} $
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
                    ?????????????????? ???????? ?? ??????????????:
                    <div>
                        {lastParsedDate}
                    </div>
                </div>

                <div style={styles.mb2}>
                    GMV ???? ?????? ??????????:
                    <div>
                        {aggregatesDelta.sum} $
                    </div>
                </div>

                <div style={styles.mb2}>
                    ???????????? ???? ?????? ??????????:
                    <div>
                        {aggregatesDelta.count}
                    </div>
                </div>

                <div style={styles.mb2}>
                    ?????????? ???????????????????? ??????????????:
                    <div>
                        {aggregatesDelta.uniqueGoods}
                    </div>
                </div>

                <RenderPeriodStats/>

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
