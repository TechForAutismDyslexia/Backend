const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childRoutes');
const gameRoutes = require('./routes/gameRoutes');
const dataRoutes = require('./routes/dataRoutes');
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());

// Database connection
mongoose.connect('mongodb://localhost:27017/TFDBACKEND', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/data', dataRoutes);
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
