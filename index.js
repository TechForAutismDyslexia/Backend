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
const Gameinfo = require('./models/Gameinfo');
const app = express();
const PORT = 5000;

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Database connection
mongoose.connect('mongodb+srv://tadrw:tad12345@cluster0.shaeuvf.mongodb.net/tfad?retryWrites=true&w=majority&appName=Cluster0', { useUnifiedTopology: true })
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

app.get('/' , (req,res) => {
    res.send('Hello JoywithLearning!');
});
// app.post('/createcentre',async(req,res) => {
//     const {name,centreId,centerid} = req.body;
//     const centrecreate = new centre({name,centreId,centerid});
//     try{
//         const savedCentre = await centrecreate.save();
//         res.send(savedCentre);
//     }
//     catch(err){
//         res.status(400).send('Error in creating centre');
//     }
// });
app.post('/creategame',async(req,res) => {
    const {gameId,gamename,gameauthor} = req.body;
    const gamecreate = new Gameinfo({gameId,gamename,gameauthor});
    try{
        const savedGame = await gamecreate.save();
        res.send(savedGame);
    }
    catch(err){
        res.status(400).send('Error in creating game');
    }

});
app.get('/*' , (req,res) => {
    res.send('You cannot access this page!');
});
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
