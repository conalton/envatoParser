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
        minValue: 0, textPosition: 'none',
        gridlines: {
            color: 'transparent'
        }
    },
    chartArea: {width: "80%", height: "90%"},
    legend: {position: "right", maxLines: 6},
    annotations: {
        alwaysOutside: false,
        textStyle: {
            fontSize: 16,
            color: '#fff',
            bold: true,
            auraColor: 'none'
        },
    },
    tooltip: {isHtml: true, trigger: "visible"},
    series: {
        0: {
            type: 'line',
            lineWidth: 4,
            pointSize: 20,
            color: '#ffaaaa',
            enableInteractivity: true,
        },

        1: {
            type: 'bars',
            lineWidth: 4,
            pointSize: 2,
            color: '#c8ddec',
            enableInteractivity: true,
        },
    }
};

const Styles = {
    flexBasis: '80%',
    height: '400px'
}

const dataEmpty = [
    ['Дата', ' '],
    [0, 0]
];

const AggregationsGraph = ({rows}) => {
    const [data, setData] = useState(dataEmpty);

    const [options, setOptions] = useState({...optionsDefault, title: 'По дням. Агрегаты'});

    useEffect(() => {
        if (!Array.isArray(rows) || !rows?.length) {
            return setData(dataEmpty);
        }

        const result = [];

        result.push([
            'Дата',
            'Продаж',
            {role: "tooltip", type: "string", p: {html: true}},
            'GMV',
            {role: "tooltip", type: "string", p: {html: true}},
        ]);

        /**
         * For more fiendly view of 2 different charts in both chart we need to find coefficient of average values of them
         * The real values are printing in tooltips
         */
        const avgCount = rows.map(item => item.cost_count_delta).reduce((a, b) => a + b) / rows.length;
        const avgSumm = rows.map(item => item.cost_sum_delta).reduce((a, b) => a + b) / rows.length;
        const countKoef = avgSumm / avgCount;

        rows.forEach(item => {
            result.push([
                new Date(item.date),
                item.cost_count_delta * countKoef,
                `<div class="chart-title">Продаж: ${item.cost_count_delta} </div>`,
                item.cost_sum_delta,
                `<div class="chart-title">GMV: ${item.cost_sum_delta} </div>`,
            ])
        });

        const Draw = () => {
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

        Draw();

    }, [rows]);

    return <Chart
        style={Styles}
        chartType="ComboChart"
        data={data}
        options={options}
    />
}

export default AggregationsGraph;
