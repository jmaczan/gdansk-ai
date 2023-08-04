import { auth } from 'express-oauth2-jwt-bearer';

// https://github.com/auth0-blog/express-vue-management-api/blob/master/server/server.js#L26
export const authorize = auth({
    audience: process.env.AUTH0_AUDIENCE,
    issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
    tokenSigningAlg: 'RS256'
});