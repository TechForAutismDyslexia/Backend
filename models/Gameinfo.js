const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const gameinfoschema = new Schema({
    gameId : { type: String, required: true },
    gamename : { type: String, required: true },
    gameauthor : { type: String, required: true }
})
module.exports = mongoose.models.Gameinfo || mongoose.model('Gameinfo', gameinfoschema);