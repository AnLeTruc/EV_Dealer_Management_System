require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: '*', 
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('<h1>Server is running on Render! </h1>');
});

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});