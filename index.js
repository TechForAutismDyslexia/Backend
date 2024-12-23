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
const tablednd = require('./routes/games/tablednd');
const memorygame = require('./routes/games/memorygame');
const shadowmatching = require('./routes/games/shadowmatching');
const Sentenceverificationglobal = require('./routes/games/sentenceverificationglobal');
const dragandmatch = require('./routes/games/dragandmatch');
const connectingletters = require('./routes/games/connectingletters');
const Imagematching = require('./routes/games/imagematching');
const Sentenceverificationbridging = require('./routes/games/Sentenceverificationbridging');
const Windowsequencing = require('./routes/games/Windowsequencing');
const app = express();
const PORT = process.env.PORT || 4000;
require('dotenv').config();

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/uploads',express.static("uploads"));
app.use('/api/users', userRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/admin',adminRoutes);  
app.use('/api/caretaker',caretakerRoutes);
app.use('/api/doctor',doctorRoutes);
app.use('/api/parent',parentRoutes);
app.use('/api/userfeedback',userfeedback);
app.use('/api/jwl',jwlapi);
app.use('/api/tablednd',tablednd);
app.use('/api/memorygame',memorygame);
app.use('/api/shadowmatching',shadowmatching);
app.use('/api/sentenceverificationglobal',Sentenceverificationglobal);
app.use('/api/dragandmatch',dragandmatch);
app.use('/api/connectingletters',connectingletters);
app.use('/api/imagematching',Imagematching);
app.use('/api/sentenceverificationbridging',Sentenceverificationbridging);
app.use('/api/windowsequencing',Windowsequencing);

app.get('/api' , (req,res) => {
    res.send('Hello JoywithLearning!');
});
app.get('/api/testing' , (req,res) => {
    res.send('API is working!');
}
);

app.get('/*' , (req,res) => {
    res.send('You cannot access this page!');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
