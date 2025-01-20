const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    const apiKey = req.headers['x-api-key'];

    if (!token && !apiKey) {
        return res.status(403).json({ error: 'Token or API key not provided' });
    }

    if (apiKey && apiKey === process.env.API_KEY) {
        return next();
    }

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(401).json({ error: 'Invalid token' });
            }
            req.user = decoded;
            next();
        });
    } else {
        return res.status(403).json({ error: 'Invalid API key' });
    }
};

module.exports = verifyToken;