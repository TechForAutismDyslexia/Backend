const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Add child information (Parent)
router.post('/childinfo', auth, async (req, res) => {
  if (req.user.role !== 'parent') return res.status(403).send('Access Denied');

  const { name, centreId, age } = req.body;
  parent = await User.findById(req.user._id);
  const parentId = parent._id;
  const parentDetail = parent.name;
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

// Admin assigns doctor and caretaker
router.put('/:id/assign', auth, async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).send('Access Denied');

  const { caretakerId, doctorId } = req.body;

  try {
    const child = await Child.findById(req.params.id);
    if (!child) return res.status(404).send('Child not found');

    child.caretakerId = caretakerId;
    child.doctorId = doctorId;
    child.adminStatus = true;

    const updatedChild = await child.save();
    res.send(updatedChild);
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
