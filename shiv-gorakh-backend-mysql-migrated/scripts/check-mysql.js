require('../config/env');
require('../app'); // Ensure all routes and 22 models are registered for schema sync
const connectDB = require('../config/db');

(async () => {
  await connectDB();
  const { getPool } = require('../config/mysql-odm');
  const [dbInfo] = await getPool().query('SELECT DATABASE() AS databaseName, VERSION() AS version');
  const [tables] = await getPool().query('SHOW TABLES');
  console.log('MySQL connection verified successfully:');
  console.log(' - Database :', dbInfo[0]?.databaseName);
  console.log(' - Version  :', dbInfo[0]?.version);
  console.log(' - Tables   :', tables.length, 'tables verified and ready');
  await getPool().end();
})().catch((error) => {
  console.error('MySQL check failed:', error.message || error.code || String(error));
  process.exitCode = 1;
});
