const jwt = require("jsonwebtoken");
require("dotenv").config();

// middleware
module.exports = function (req, res, next) {
  // get the token
  const token = req.header("Authorization");

  // check token existence
  if (!token) {
    return res.status(401).json({ error: "No token. Authorization denied." });
  }

  // remove 'Bearer' from token format
  const actualToken = token.split(" ")[1];

  // if token is invalid
  if (!actualToken) {
    return res.status(401).json({ error: "Token format is invalid." });
  }

  // verifiy the token
  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET);

    // if valid, add user info
    req.user = { id: decoded.id };

    // call the next middleware
    next();
  } catch (error) {
    res.status(401).json(`error: ${error.message}`);
  }
};
