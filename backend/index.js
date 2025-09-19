require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// for future routes

// 
app.get('/', (req, res) =>{
    res.send('salin: Money Tracker API is running!');
});

app.listen(PORT, () =>  {
    console.log(`Server is running on port ${PORT}`);
});