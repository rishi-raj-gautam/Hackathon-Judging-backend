const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    // Get the token from Authorization header
    const authHeader = req.header("Authorization");
    if (!authHeader) return res.status(401).json({ message: "Access Denied. No token provided." });
    
    // Extract the token (remove "Bearer " prefix if present)
    const token = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid or expired token." });
    }
};

module.exports = authMiddleware;