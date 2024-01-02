const express = require('express');
const dotenv = require('dotenv').config();

const PORT = process.env.PORT || 4000;

const app = express();

app.post('/pay', (req, res) => {
    res.send("Hello world");
})

app.listen(PORT, () => {
    console.log("App is running");
})
