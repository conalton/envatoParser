import {Chart} from "react-google-charts";
import dynamic from 'next/dynamic';
import React, {useState, useEffect} from 'react';
import axios from "axios";

export const TermsSelectorBlock = dynamic(() => import('../components/TermsSelector'));

export default function Index() {
    const mainStyle = {
        display: "flex",
        justifyContent: "center",
        flexBasis: "100%"
    }

    const leftPanelStyle = {
        flexBasis: '20%'
    }

    const chartArea = {
        flexBasis: '80%',
        height: '400px'
    }

    const [data, setData] = useState([
        ['Дата', 0]
    ]);

    const [options, setOptions] = useState({});

    const [aggregates, setAggregates] = useState({
        sum: 0,
        countGoods: 0
    });

    const onChooseTerm = (value) => {
        if (value?.id) {
            axios.get('/api/getData', {
                params: {term: value.id}
            }).then(response => {
                if (Array.isArray(response?.data?.rows)) {

                    const ticks = new Map();

                    response?.data.rows.forEach((item, key) => {
                        if (key > 0) {
                            item[0] = new Date(item[0]);

                            ticks.set(item[0].getTime(), item[0]);
                        }
                    });

                    setOptions({
                        title: "",
                        isStacked: true,
                        hAxis: {
                            ticks: Array.from(ticks.values()),
                            format: 'dd.MM.y',
                            titleTextStyle: {color: "#333"}
                        },
                        vAxis: {minValue: 0},
                        chartArea: {width: "80%", height: "90%"},
                        legend: {position: "right", maxLines: 6},
                    });

                    setData(response.data.rows);
                }

                if (response?.data?.aggregates) {
                    const newState = {
                        sum: response?.data?.aggregates.sum,
                        countGoods: response?.data?.aggregates.count
                    }

                    setAggregates(newState);
                }

            });
        }
        console.log(value);
    }

    const mb2 = {
        marginBottom: '1.5rem'
    }

    return (
        <div style={mainStyle}>
            <div style={leftPanelStyle}>
                <TermsSelectorBlock onChange={onChooseTerm}/>

                <div style={mb2}>
                    Выручка:
                    <div>
                        {aggregates.sum}
                    </div>
                </div>

                <div style={mb2}>
                    Количество товаров:
                    <div>
                        {aggregates.countGoods}
                    </div>
                </div>
            </div>

            <Chart
                style={chartArea}
                chartType="AreaChart"
                data={data}
                options={options}
            />
        </div>
    )
}
