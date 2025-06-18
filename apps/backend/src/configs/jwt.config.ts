import 'dotenv/config';

export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'SECRET_KEY',
    expiresIn: process.env.JWT_EXPIRES_IN || '3600s',
    refreshSecret: process.env.JWT_REFRESH_TOKEN || 'REFRESH_SECRET',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '1d',
    localTokenSecret: process.env.LOCAL_TOKEN_SECRET || 'LOCAL_TOKEN_SECRET',
};