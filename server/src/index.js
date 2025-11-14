const express = require("express");
const cors = require("cors");
const os = require("os");
const app = express();

// Middleware
// app.use(cors()); // frontend-to-backend communication
app.use(express.json()); // allows for reading JSON requests

// constructin the path
app.use(express.static(path.join(__dirname, '../../client/public')));

// API routes
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/transactions", require("./routes/transaction.routes.js"));
app.use("/api/accounts", require("./routes/account.routes.js"));
app.use("/api/budget", require("./routes/budget.routes.js"));
app.use("/api/categories", require("./routes/category.routes.js"));
app.use("/api/parse", require("./routes/parsing.routes.js"));
app.use("/api/dashboard", require("./routes/dashboard.routes.js"));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../../../client/public', 'index.html'));
});

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

// this will only listed in a non-vercel deployment
if (process.env.VERCEL_ENV !== 'production') {
  app.listen(PORT, "0.0.0.0", () => {
    // The os-based IP logging is great for local dev but not needed for Vercel.
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
    if (ips.length > 0) {
      console.log(`Access it from your phone at: http://${ips[0]}:${PORT}`);
    }
  });
}

module.exports = app();