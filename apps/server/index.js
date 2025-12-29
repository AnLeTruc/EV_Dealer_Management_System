require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const helmet = require('helmet');
const morgan = require('morgan');

// Connect DB
connectDB();
 
const app = express();

//Helmet
app.use(helmet());

//Morgan
app.use(morgan('dev'));

//CORS
app.use(cors({
    origin: '*', 
    credentials: true
}));

app.use(express.json());

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/accounts', require('./routes/accountRoutes'));

app.get('/', (req, res) => {
    res.send('<h1>Server is running on Render! </h1>');
});

app.listen(process.env.PORT, () => {
    console.log(`Server started on port ${process.env.PORT}`);
});