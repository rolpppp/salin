require("dotenv").config();
const express = require("express");
const path = require("path");
const cors = require("cors");
const os = require("os");
const serverless = require('serverless-http');
const app = express();

// middleware
app.use(cors()); // frontend-to-backend communication
app.use(express.json()); // allows for reading JSON requests

// API routes
app.use("/api/auth", require("./_app/routes/auth.routes.js"));
app.use("/api/transactions", require("./_app/routes/transaction.routes.js"));
app.use("/api/accounts", require("./_app/routes/account.routes.js"));
app.use("/api/budget", require("./_app/routes/budget.routes.js"));
app.use("/api/categories", require("./_app/routes/category.routes.js"));
app.use("/api/parse", require("./_app/routes/parsing.routes.js"));
app.use("/api/dashboard", require("./_app/routes/dashboard.routes.js"));

// simple error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message, //
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

module.exports.handler = serverless(app);
