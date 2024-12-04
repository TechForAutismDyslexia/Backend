const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const centre = require('./models/Centre');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');
const dataRoutes = require('./routes/dataRoutes');
const adminRoutes = require('./routes/adminRoutes');
const caretakerRoutes = require('./routes/caretakerRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const parentRoutes = require('./routes/parentRoutes');
const userfeedback = require('./routes/userFeedback');
const jwlapi = require('./routes/jwlRoutes');
const Gameinfo = require('./models/Gameinfo');
const app = express();
const PORT = process.env.PORT || 4000;
require('dotenv').config();

// Middleware
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/caretaker',caretakerRoutes);
app.use('/api/doctor',doctorRoutes);
app.use('/api/parent',parentRoutes);
app.use('/api/userfeedback',userfeedback);
app.use('/api/jwl',jwlapi);

app.get('/api' , (req,res) => {
    res.send('Hello JoywithLearning!');
});
app.get('/api/testing' , (req,res) => {
    res.send('API is working!');
}
);
app.get('/api/get-test-video', (req, res) => {
    const videoPath = "/home/uploads/jwluploads/pvrkmsbunny.mp4";
    res.sendFile(videoPath, (err) => {
        if(err) {
            console.error('Error sending video:', err);
            res.status(500).send('Error sending video');
        }
    });
});
app.get('/*' , (req,res) => {
    res.send('You cannot access this page!');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
