const express = require('express');
const Child = require('../models/child');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Feedback = require('../models/Feedback');
const Consultation = require('../models/Consultations');
const IEPDoctor = require('../models/IEPDoctor');
const router = express.Router();


// Get assigned children and caretakers for doctor
router.get('/assigned', auth, async (req, res) => {
  if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');

  try {
    const children = await Child.find({ doctorId: req.user._id }).populate('caretakerId');
    children.reverse();
    res.send(children);
  } catch (err) {
    res.status(400).send(err);
  } 
});

// Feedback
router.put('/feedback/:childId', auth, async (req, res) => {
    if (req.user.role !== 'doctor') return res.status(403).send('Access Denied');
    const {childId} = req.params;
    const {feedback} = req.body;
    const role = 'doctor';
    if (!childId) return res.status(400).send('Child ID is required');
    try {
        const doctor = await User.findById(req.user._id);
        if (!doctor) return res.status(404).send('Doctor not found');
        const name = doctor.name;
        let feedbackDoc = await Feedback.findOne({ childId });
        if (!feedbackDoc) {
            feedbackDoc = new Feedback({ childId, name,role, feedback: [feedback] });
        } else {
            feedbackDoc.feedback.push(feedback);
        }
        await feedbackDoc.save();
        res.status(200).send(feedbackDoc);
    } catch (error) {
        res.status(500).send('Server error');
    }
});

router.put("/assignIEP/:childId", async (req, res) => {
    const {doctorId,therapy,therapistName,feedback,monthlyGoals,iepId,startingMonth,startingYear,selectedMonths,selectedMonthsNames} = req.body;

    const {childId} = req.params;
    
    
    if (!doctorId || !therapy || !therapistName || !monthlyGoals || !startingMonth || !startingYear || !selectedMonthsNames) {
        return res.status(400).send("Please provide all the details");
    }
    

    try {
        const doctor = await User.findById(doctorId);
        if (!doctor) return res.status(404).send("Doctor not found");

        const child = await Child.findById(childId);
        if (!child) return res.status(404).send("Child not found");

        if (iepId) {
            const updatedIEP = await IEPDoctor.findOneAndUpdate(
                { _id: iepId, childId: childId }, 
                { doctorId, therapy, therapistName, monthlyGoals, selectedMonths, feedback, startingMonth, startingYear,selectedMonthsNames},
                { new: true } 
            );

            if (!updatedIEP) return res.status(404).send("IEP not found");
            res.send(updatedIEP);
        } 
        else {
            const iep = new IEPDoctor({
                doctorId,
                childId,
                therapy,
                therapistName,
                monthlyGoals,
                selectedMonths,
                feedback,
                startingMonth,
                startingYear,
                selectedMonthsNames
            });

            await iep.save();
            res.send(iep);
        }
    } catch (error) {
        res.status(500).send("Server error");
    }
});

router.get('/getConsultations', auth, async (req, res) => {
    const doctorID = req.user._id;
    if (req.user.role !== 'doctor') {
        return res.status(403).send('Access Denied');
    }

    try {
        
        const consultations = await Consultation.find({ doctorID: doctorID });
        if (!consultations.length) {
            return res.status(404).send('No consultations found for this doctor on this date');
        }
        res.send(consultations);

    } catch (err) {
        res.status(400).send(err.message); 
    }
});

router.put('/updateperformance/:childId', auth, async (req, res) => {
    if(!req.user.role === 'caretaker') return res.status(403).send('Access Denied');
    const { childId } = req.params;
    const { performance,month,therapistFeedback } = req.body;
    if (!childId) return res.status(400).send('Child ID is required');

    try {
        const iep = await IEPDoctor.findOne({ childId : childId });
        if (!iep) return res.status(404).send('IEP not found');
        for (let i = 0; i < iep.monthlyGoals.length; i++) {
            if (iep.monthlyGoals[i].month === month) {
                iep.monthlyGoals[i].performance = performance;
                iep.monthlyGoals[i].therapistFeedback = therapistFeedback;
                break;
            }
        }
        await iep.save();
        res.status(200).send("Performance updated successfully");
    } catch (error) {
        res.status(500).send(error);
    }
});

router.put('/IEPfeedback/:childId', auth, async (req, res) => {
    const childId = req.params.childId;
    const {feedback,month} = req.body;
    if (!childId) return res.status(400).send('Child ID is required');
    try{
        const iep = await IEPDoctor.findOne({ childId : childId });
        if (!iep) return res.status(404).send('IEP not found');
        for (let i = 0; i < iep.monthlyGoals.length; i++) {
            if (iep.monthlyGoals[i].month === month) {
                iep.monthlyGoals[i].doctorFeedback = feedback;
                break;
            }
        }
        await iep.save();
        res.status(200).send("Feedback added successfully");
        
    }
    catch(err){
        res.status(500).send(err);
    }

});

module.exports = router;
