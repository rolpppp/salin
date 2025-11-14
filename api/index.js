const express = require("express");
const path = require("path");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

// API mounted under /api
app.use("/api/auth", require("./_app/routes/auth.routes.js"));
app.use("/api/transactions", require("./_app/routes/transaction.routes.js"));
app.use("/api/accounts", require("./_app/routes/account.routes.js"));
app.use("/api/budget", require("./_app/routes/budget.routes.js"));
app.use("/api/categories", require("./_app/routes/category.routes.js"));
app.use("/api/parse", require("./_app/routes/parsing.routes.js"));
app.use("/api/dashboard", require("./_app/routes/dashboard.routes.js"));

// Static files
app.use(express.static(path.join(__dirname, '../client/public')));

// Catch-all for SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) return; 
  res.sendFile(path.resolve(__dirname, '../client/public/index.html'));
});

module.exports = app;
