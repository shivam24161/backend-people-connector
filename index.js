const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const cors = require('cors');

dotenv.config();
const app = express();

// CORS setup
app.use(cors({
    origin: 'http://localhost:5173',
    credentials: true
}));

mongoose.connect(process.env.MONGO_URL).then(() => {
    console.log("db connected")
}).catch((err) => console.log(err))

app.use(express.json());
app.use(cookieParser());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.listen(process.env.PORT || 5000, () => {
    console.log(`listing on port ${process.env.PORT || 5000}`);
})
