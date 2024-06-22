const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Add child information (Parent)
router.post('/childinfo', auth, async (req, res) => {
  if (req.user.role !== 'parent') return res.status(403).send('Access Denied');
  const { name, centreId, age } = req.body;
  const childs = await Child.findOne({ name, centreId, age });
  if (childs) return res.status(400).send('Child already exists');
  parent = await User.findById(req.user._id);
  console.log(parent)
  const parentId = parent._id;
  const parentDetail = parent.username;
  console.log(parentDetail);
  const child = new Child({
    name,
    centreId,
    age,
    parentDetails: parentDetail,
    parentId
  });

  try {
    const savedChild = await child.save();
    res.send(savedChild);
  } catch (err) {
    res.status(400).send(err);
  }
});


// Get assigned children for caretaker
router.get('/caretaker/assigned', auth, async (req, res) => {
  if (req.user.role !== 'caretaker') return res.status(403).send('Access Denied');

  try {
    const children = await Child.find({ caretakerId: req.user._id });
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});

// Get assigned children and caretakers for doctor
router.get('/doctor/assigned', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');

  try {
    const children = await Child.find({ doctorId: req.user._id }).populate('caretakerId');
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  }
});
router.get('/:parentId/child',auth,async(req,res) => {
  if(req.user.role !== 'parent') return res.status(400).send('Access Denied');
  try{
    const children = await Child.find({parentId:req.params.parentId});
    res.send(children);
  }
  catch(err){
    res.status(400).send(err);
  }
});
module.exports = router;
