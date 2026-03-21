const mysql = require('mysql2/promise');

mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root'
})
.then(() => console.log('✅ MySQL连接成功'))
.catch(err => console.error('❌ MySQL连接失败:', err.message))
.finally(() => process.exit(0));
