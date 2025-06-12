const config = {
    server: process.env.AZURE_SQL_SERVER,
    database: process.env.AZURE_SQL_DATABASE,
    authentication: {
        type: 'default',
        options: {
            userName: process.env.AZURE_SQL_USER,
            password: process.env.AZURE_SQL_PASSWORD
        }
    },
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

export default config; 