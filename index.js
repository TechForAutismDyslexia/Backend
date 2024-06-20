const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const childRoutes = require('./routes/childRoutes');
const gameRoutes = require('./routes/gameRoutes');
const dataRoutes = require('./routes/dataRoutes');
const adminRoutes = require('./routes/adminRoutes');
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Database connection
mongoose.connect('mongodb+srv://shivasaicharandodda:9nnaypS3Um6Z6eMU@cluster.47f8iht.mongodb.net/tfad', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/children', childRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin',adminRoutes);
app.get('/' , (req,res) => {
    res.send('Hello JoywithLearning!');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
