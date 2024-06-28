const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const gametrialSchema = new Schema({
    gameId:{type:Number,required:true},
    tries:{type:Number,required:true},
    timer:{type:Number,required:true},
    status:{type:Boolean,required:true},
});
module.exports = mongoose.models.Gametrial || mongoose.model('Gametrial',gametrialSchema);