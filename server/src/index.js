const express = require("express");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors()); // frontend-to-backend communication
app.use(express.json()); // allows for reading JSON requests

// API routes
app.use("/api/auth", require("./routes/auth.routes.js"));
app.use("/api/transactions", require("./routes/transaction.routes.js"));

// simple error-handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Something went wrong!",
    details: err.message, // This gives you the specific error
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}`);
});
