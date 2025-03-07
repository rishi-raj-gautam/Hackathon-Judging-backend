const mongoose = require('mongoose');

const JudgeSchema = new mongoose.Schema({
    judgeID: String,
    password: String,
});

module.exports = mongoose.model('Judge', JudgeSchema);