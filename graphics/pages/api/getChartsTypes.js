import {getTerms} from '../../libs/chartsTypes';

export default async function handler(req, res) {
    const terms = await getTerms();
    res.status(200).json(terms);
}
