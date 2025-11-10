const express = require("express");
const cors = require("cors");
const os = require("os");
const app = express();

// Middleware
app.use(cors()); // frontend-to-backend communication
app.use(express.json()); // allows for reading JSON requests

// API routes
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/transactions", require("./routes/transaction.routes.js"));
app.use("/api/accounts", require("./routes/account.routes.js"));
app.use("/api/budget", require("./routes/budget.routes.js"));
app.use("/api/categories", require("./routes/category.routes.js"));
app.use("/api/parse", require("./routes/parsing.routes.js"));

// simple error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message, // This gives you the specific error
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  const networkInterfaces = os.networkInterfaces();
  const ips = [];
  for (const name of Object.keys(networkInterfaces)) {
    for (const iface of networkInterfaces[name]) {
      if (iface.family === "IPv4" && !iface.internal) {
        ips.push(iface.address);
      }
    }
  }
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access it from your phone at: http://${ips[0]}:${PORT}`);
});
