const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Our server is running successfully
========================================
Environment : ${process.env.NODE_ENV}
Port        : ${PORT}
URL         : http://localhost:${PORT}
========================================
`);
  });
};

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exitCode = 1;
});
