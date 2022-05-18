import DatePicker from "react-datepicker";
import 'react-datepicker/dist/react-datepicker.css';
import InputMask from "react-input-mask";

const PeriodFilter = ({onChangeDf, onChangeDt, df, dt, dateFormat = 'dd.MM.yyyy'}) => {

    return <div style={{display: 'flex'}}>
        <DatePicker
            selected={df}
            onChange={onChangeDf}
            selectsStart
            startDate={df}
            dateFormat={dateFormat}
            endDate={dt}
            customInput={
                <InputMask mask="99.99.9999" />
            }
        />

        <DatePicker
            selected={dt}
            onChange={onChangeDt}
            selectsEnds
            dateFormat={dateFormat}
            startDate={df}
            endDate={dt}
            minDate={df}
            customInput={
                <InputMask mask="99.99.9999" />
            }
        />

    </div>
}

export default PeriodFilter;
