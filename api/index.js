const express = require("express");
const path = require("path");
const cors = require("cors");
const os = require("os");
const app = express();

// Middleware
app.use(cors()); // Enable CORS for frontend-to-backend communication
app.use(express.json()); // Parse JSON requests

// API routes - MUST come BEFORE static files
app.use("/auth", require("./_app/routes/auth.routes.js"));
app.use("/transactions", require("./_app/routes/transaction.routes.js"));
app.use("/accounts", require("./_app/routes/account.routes.js"));
app.use("/budget", require("./_app/routes/budget.routes.js"));
app.use("/categories", require("./_app/routes/category.routes.js"));
app.use("/parse", require("./_app/routes/parsing.routes.js"));
app.use("/dashboard", require("./_app/routes/dashboard.routes.js"));

// Static files - AFTER API routes
app.use(express.static(path.join(__dirname, '../client/public')));

// Catch-all route - MUST be LAST and only for non-API routes
app.get('*', (req, res) => {
  // Don't serve HTML for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.resolve(__dirname, '../client/public', 'index.html'));
});

// Error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3000;

// Only listen in non-Vercel deployment
if (process.env.VERCEL_ENV !== 'production') {
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
    if (ips.length > 0) {
      console.log(`Access it from your phone at: http://${ips[0]}:${PORT}`);
    }
  });
}

module.exports = app;