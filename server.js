// Entry point for the application
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure CORS
const corsOptions = {
    origin: 'http://localhost:4200', // Domínio do seu frontend
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Database connection
const db = require('./config/db');

// Routes
const messageRoutes = require('./src/routes/messageRoutes');
app.use('/api/messages', messageRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});