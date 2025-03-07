const express = require('express');
const Team = require('../models/Team');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Get all teams - Add authMiddleware
router.get('/', authMiddleware, async (req, res) => {
    try {
        const teams = await Team.find();
        res.json(teams);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching teams' });
    }
});

// Add a new team
router.post('/', authMiddleware, async (req, res) => {
    console.log("Received body:", req.body);
    const { teamID, teamName, teamLeader } = req.body;
    if (!teamID || !teamName || !teamLeader) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        const newTeam = new Team({ teamID, teamName, teamLeader });
        await newTeam.save();
        res.json({ message: 'Team added successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error saving team' });
    }
});

module.exports = router;