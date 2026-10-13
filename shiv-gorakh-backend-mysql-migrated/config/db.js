const mysqlOdm = require("./mysql-odm");

const connectDB = async () => {
  try {
    await mysqlOdm.connect();
    console.log("========================================\n✅ Hostinger MySQL Connected Successfully\n========================================");
  } catch (error) {
    console.error("MySQL connection failed:", error.message || error.code || String(error));
    throw error;
  }
};

module.exports = connectDB;
