export const requireAuth = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    next();
};

export const requireAdmin = (req, res, next) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Требуется авторизация' });
    }
    if (req.session.userRole !== 'АДМИНИСТРАТОР') {
        return res.status(403).json({ error: 'Недостаточно прав' });
    }
    next();
};

export const attachUser = (req, res, next) => {
    if (req.session.userId) {
        req.user = {
            id: req.session.userId,
            login: req.session.userLogin,
            role: req.session.userRole
        };
    }
    next();
};