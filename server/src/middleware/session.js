import session from 'express-session';
import MongoStore from 'connect-mongo';

export default session({
    name: 'sessionId',
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI || 'mongodb://localhost:27017/el-store-db',
        ttl: 24 * 60 * 60 // 1 день
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 день
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    }
});