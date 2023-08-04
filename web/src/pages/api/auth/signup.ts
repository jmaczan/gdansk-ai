import { handleLogin } from '@auth0/nextjs-auth0';
import { NextApiRequest, NextApiResponse } from 'next';

const signupHandler = (req: NextApiRequest, res: NextApiResponse) =>
    handleLogin(req, res, {
        authorizationParams: {
            screen_hint: 'signup',
        },
    });

export default signupHandler;