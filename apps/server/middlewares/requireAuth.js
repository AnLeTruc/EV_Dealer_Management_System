const { verifyAccessToken } = require('./jwt');

module.exports = function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Missing or invalid Authorization header' });
        }

        const token = header.slice('Bearer '.length).trim();
        const payload = verifyAccessToken(token);

        req.user = {
            id: payload.sub,
            role: payload.role,
            branch: payload.branch ?? null,
        };

        return next();
    } catch (err) {
        return res.status(401).json({
            message: 'Invalid or expired token',
            error: err?.message,
        });
    }
};
