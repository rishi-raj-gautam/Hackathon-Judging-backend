const mongoose = require('mongoose');

const ScoreSchema = new mongoose.Schema({
    teamID: String,
    round: Number,
    originality: { type: Number, min: 0, max: 25 },
    feasibility: { type: Number, min: 0, max: 25 },
    problemSolutionFit: { type: Number, min: 0, max: 30 },
    impact: { type: Number, min: 0, max: 20 },

    technicalC: { type: Number, min: 0, max: 30 },
    progress: { type: Number, min: 0, max: 25 },
    uiuxD: { type: Number, min: 0, max: 20 },
    collaborationP: { type: Number, min: 0, max: 25 },

    functionality: { type: Number, min: 0, max: 35 },
    scalability: { type: Number, min: 0, max: 20 },
    uiuxP: { type: Number, min: 0, max: 15 },
    creativity: { type: Number, min: 0, max: 30 },
    totalScore: Number,
});
module.exports = mongoose.model('Score', ScoreSchema);