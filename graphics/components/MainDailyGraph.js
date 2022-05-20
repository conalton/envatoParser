import React, {useState, useEffect} from 'react';
import {Chart} from "react-google-charts";

const optionsDefault = {
    hAxis: {
        format: 'dd.MM.y',
        titleTextStyle: {color: "#333"},
        gridlines: {
            color: 'transparent'
        }
    },
    vAxis: {
        minValue: 0,
        gridlines: {
            color: 'transparent'
        }
    },
    chartArea: {width: "80%", height: "90%"},
    legend: {position: "right", maxLines: 6},
};

const Styles = {
    flexBasis: '80%',
    height: '400px'
}

const dataEmpty = [
    ['Дата', ' '],
    [0, 0]
];

const MainDailyGraph = ({rows}) => {
    const [data, setData] = useState(dataEmpty);
    const [options, setOptions] = useState({...optionsDefault, title: 'По дням'});

    useEffect(() => {
        if (!Array.isArray(rows) || !rows?.length) {
           return setData(dataEmpty);
        }

        const uniqueGoods = new Map();
        const result = [];
        const uniqueDates = new Set();

        const Draw = () =>{
            const ticks = new Map();

            result?.forEach((item, key) => {
                if (key > 0 && item?.[0] && item[0] > 0) {
                    const time = item[0];
                    item[0] = new Date(item[0]);
                    ticks.set(time, item[0]);
                }
            });

            setOptions({
                ...options,
                hAxis: {
                    ...options.hAxis,
                    ticks: Array.from(ticks.values()),
                },
            });

            setData(result);
        }

        rows.forEach(item => {
            uniqueDates.add(item.date);
        })

        rows.forEach(item => {
            if (item.id) {
                uniqueGoods.set(item.id, item.name);
            }
        });

        if (!uniqueDates.size) {
            result.push(['Дата', '-']);
            result.push([0, 0]);

            return Draw();
        }

        result.push([
            'Дата', ...Array.from(uniqueGoods.values())
        ]);

        Array.from(uniqueDates.values()).forEach(date => {
            const dateData = [date];

            Array.from(uniqueGoods.keys()).forEach(goodId => {
                let statsData = rows.find(x => x.id === goodId && x.date === date);

                if (statsData === undefined) {
                    return dateData.push(0);
                }

                return dateData.push(statsData.number_of_sales_inc);
            });

            result.push(dateData);

        });

        Draw();

    }, [rows]);

    return <Chart
        style={Styles}
        chartType="AreaChart"
        data={data}
        options={options}
    />
}

export default MainDailyGraph;
