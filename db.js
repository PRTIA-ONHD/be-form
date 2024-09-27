const sql = require('mssql');

const config = {
    user: 'sa', // ชื่อผู้ใช้ฐานข้อมูล
    password: 'Password_123#', // รหัสผ่าน
    server: 'localhost', // ที่อยู่เซิร์ฟเวอร์ (เช่น localhost)
    database: 'petinfoDB', // ชื่อฐานข้อมูล
    options: {
        encrypt: true, // ใช้สำหรับ Azure
        trustServerCertificate: true // ใช้สำหรับการพัฒนาใน localhost
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
