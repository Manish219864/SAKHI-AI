const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/alerts', require('./routes/alerts'));
app.use('/api/risk', require('./routes/risk'));

// Default Route
app.get('/', (req, res) => {
    res.send('Sakhi API is running');
});

// Database Connection
const prompt = "MongoDB connection error. Ensure MongoDB is running locally on port 27017.";
if (process.env.MONGO_URI) {
    mongoose.connect(process.env.MONGO_URI.replace('localhost', '127.0.0.1'), {
        serverSelectionTimeoutMS: 5000 // Fail fast if no DB
    })
        .then(() => console.log('MongoDB Connected'))
        .catch(err => {
            console.error(prompt, err.message);
            console.log("⚠️  Falling back to In-Memory Mock Database for prototype.");
        });
} else {
    console.log('No MONGO_URI found. Running in offline mode.');
}

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
