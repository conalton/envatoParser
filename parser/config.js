const getConfig = () => {
    return {
        "api": {
            "token": process.env.API_TOKEN,
            "url": process.env.API_URL
        },

        "category": process.env.CATEGORY,
        "database": {
            "host": process.env.DB_HOST,
            "user": process.env.DB_USER,
            "password": process.env.DB_PASSWORD,
            "database": process.env.DB_NAME,
            "dialect": process.env.DB_DIALECT
        },
        "terms": process.env?.TERMS?.split('|')
    }
}

module.exports = getConfig();
