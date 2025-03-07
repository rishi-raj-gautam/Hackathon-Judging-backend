const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Judge = require('../models/Judges');

const router = express.Router();

// Register Judge
router.post('/register', async (req, res) => {
    const { judgeID, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newJudge = new Judge({ judgeID, password: hashedPassword });
    await newJudge.save();
    res.json({ message: 'Judge registered successfully' });
});

// Login Judge (Fix: Add `id` to the token payload)
router.post('/login', async (req, res) => {
    const { judgeID, password } = req.body;
    const judge = await Judge.findOne({ judgeID });

    if (!judge || !(await bcrypt.compare(password, judge.password))) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token with the judge's ID
    const token = jwt.sign({ judgeID: judge.judgeID, id: judge._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ token });
});

module.exports = router;
