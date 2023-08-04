import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
    login: handleLogin({
        authorizationParams: {
            audience: process.env.AUTH0_AUDIENCE, // or AUTH0_AUDIENCE,
            scope: 'openid profile email offline_access' //['openid', 'profile']
            // Add the `offline_access` scope to also get a Refresh Token
            // scope: 'openid profile email read:products' // or AUTH0_SCOPE
        }
    })
});