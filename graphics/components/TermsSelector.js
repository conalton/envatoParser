import AsyncSelect from 'react-select/async';
import React, {useState, useEffect} from 'react';
import axios from "axios";

function TermsSelector({onChange}) {
    const [inputValue, setValue] = useState('');
    const [selectedValue, setSelectedValue] = useState(null);

    // handle input change event
    const handleInputChange = value => {
        setValue(value);
    };

    // handle selection
    const handleChange = value => {
        setSelectedValue(value);
        if (typeof onChange === 'function') {
            onChange(value);
        }
    }

    const fetchData = () => {
        return axios.get('/api/getChartsTypes').then(result => {
            if (Array.isArray(result?.data)) {
                return result?.data.map(item => {
                    return {id: item, name: item}
                });
            }
        });
    }

    return (

            <AsyncSelect
                cacheOptions
                defaultOptions
                value={selectedValue}
                getOptionLabel={e => e.name}
                getOptionValue={e => e.id}
                loadOptions={fetchData}
                onInputChange={handleInputChange}
                onChange={handleChange}
            />

    );
}

export default TermsSelector;
