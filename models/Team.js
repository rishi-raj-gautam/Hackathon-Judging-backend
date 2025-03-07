const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
    teamID: String,
    teamName: String,
    teamLeader: String,
});

module.exports = mongoose.model('Team', TeamSchema);