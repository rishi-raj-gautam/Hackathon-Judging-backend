const express = require('express');
const Score = require('../models/Score');
const Team = require('../models/Team');
const jwt = require('jsonwebtoken'); // Required to extract judgeID from the token
const authMiddleware = require('../middleware/authMiddleware'); // Ensure authentication

const router = express.Router();

// 🛑 Prevent duplicate submissions for the same round
// Fix the submit-score route
// Fix the submit-score route
router.post('/submit-score', authMiddleware, async (req, res) => {
    try {
        const { teamID, round, originality, feasibility, problemSolutionFit, impact, technicalC,progress, uiuxD, collaborationP ,functionality, scalability, uiuxP, creativity } = req.body;

        if (!teamID) {
            return res.status(400).json({ message: "Team ID is required." });
        }

        // Extract judgeID from the authenticated user
        const judgeID = req.user.judgeID || req.user.id;
        if (!judgeID) {
            return res.status(400).json({ message: "Judge authentication failed. Please log in again." });
        }

        // Calculate total score from all components
        const totalScore = Number(originality || 0) + 
                          Number(feasibility || 0) + 
                          Number(problemSolutionFit || 0) +
                          Number(impact || 0) + 
                          Number(technicalC || 0) + 
                          Number(progress || 0) +
                          Number(uiuxD || 0) + 
                          Number(collaborationP || 0) + 
                          Number(functionality || 0) + 
                          Number(scalability || 0) + 
                          Number(uiuxP || 0) + 
                          Number(creativity || 0);

        // Check if this judge has already submitted for THIS SPECIFIC team in this round
        const existingScore = await Score.findOne({ judgeID, teamID, round });

        if (existingScore) {
            return res.status(400).json({ message: "You have already submitted scores for this team in this round." });
        }

        // Save the new score with the calculated total
        const newScore = new Score({
            judgeID,
            teamID,
            round,
            originality: Number(originality || 0),
            feasibility: Number(feasibility || 0),
            problemSolutionFit: Number(problemSolutionFit || 0),
            impact: Number(impact || 0),
            technicalC: Number(technicalC || 0),
            progress: Number(progress || 0),
            uiuxP: Number(uiuxP || 0),
            collaborationP: Number(collaborationP || 0),
            functionality: Number(functionality || 0),
            scalability: Number(scalability || 0),
            uiuxP: Number(uiuxP || 0),
            creativity: Number(creativity || 0),
            totalScore
        });

        await newScore.save();
        res.status(201).json({ message: "Score submitted successfully!" });

    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ message: "Validation failed.", errors });
        }
        console.error(error);
        res.status(500).json({ message: "Server error. Could not submit score." });
    }
});

// Get rounds and teams that a judge has already submitted
router.get('/submitted-rounds', authMiddleware, async (req, res) => {
    try {
        const judgeID = req.user.judgeID || req.user.id;
        if (!judgeID) {
            return res.status(400).json({ message: "Judge authentication failed. Please log in again." });
        }

        // Find all scores submitted by this judge
        const submissions = await Score.find({ judgeID });
        
        // Create an array of objects with round and teamID information
        const submittedData = submissions.map(submission => ({
            round: submission.round,
            teamID: submission.teamID
        }));

        res.json(submittedData);
    } catch (error) {
        console.error("Error getting submitted rounds:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// ✅ Leaderboard API: Sum all scores across rounds and judges
router.get('/leaderboard', async (req, res) => {
    try {
        const scores = await Score.aggregate([
            { 
                $group: {
                    _id: "$teamID",
                    totalScore: {
                        $sum: {
                            $add: [
                                { $ifNull: ["$originality", 0] },
                                { $ifNull: ["$feasibility", 0] },
                                { $ifNull: ["$problemSolutionFit", 0] },
                                { $ifNull: ["$impact", 0] },
                                { $ifNull: ["$technicalC", 0] },
                                { $ifNull: ["$progress", 0] },
                                { $ifNull: ["$uiuxD", 0] },
                                { $ifNull: ["$collaborationP", 0] },
                                { $ifNull: ["$functionality", 0] },
                                { $ifNull: ["$scalability", 0] },
                                { $ifNull: ["$uiuxP", 0] },
                                { $ifNull: ["$creativity", 0] }
                            ]
                        }
                    }
                }
            },
            { 
                $lookup: {
                    from: "teams", 
                    localField: "_id",
                    foreignField: "teamID",
                    as: "teamDetails"
                }
            },
            { 
                $unwind: "$teamDetails"
            },
            {
                $project: {
                    _id: 0,
                    teamID: "$_id",
                    teamName: "$teamDetails.teamName",
                    totalScore: 1
                }
            },
            { 
                $sort: { totalScore: -1 }
            }
        ]);

        console.log("Leaderboard Data:", scores); // Debugging

        res.json(scores);
    } catch (error) {
        console.error("Leaderboard Error:", error);
        res.status(500).json({ message: "Error fetching leaderboard" });
    }
});

// ✅ Check if a judge has already submitted a score for a round
router.get('/check', authMiddleware, async (req, res) => {
    try {
        const { teamID, round } = req.query;
        const judgeID = req.user.id;

        const existingScore = await Score.findOne({ judgeID, teamID, round });

        if (existingScore) {
            return res.json({ exists: true });
        } else {
            return res.json({ exists: false });
        }
    } catch (error) {
        console.error("Error checking existing score:", error);
        res.status(500).json({ message: "Error checking score" });
    }
});

module.exports = router;
