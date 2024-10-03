const sql = require('mssql');

const config = {
    user: 'youruser', 
    password: 'yourpass', 
    server: 'yourserver',
    database: 'yourdatabase',
    options: {
        encrypt: true, 
        trustServerCertificate: true 
    }
};

async function connectToDatabase() {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server');
    } catch (err) {
        console.error('Database connection failed:', err);
    }
}

module.exports = { sql, connectToDatabase };
