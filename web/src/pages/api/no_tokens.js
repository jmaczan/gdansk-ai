import httpProxyMiddleware from "next-http-proxy-middleware";
import { getAccessToken } from '@auth0/nextjs-auth0';

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export const config = {
    api: {
        bodyParser: false,
    },
}

export default async function handler(req, res) {
    httpProxyMiddleware(req, res, {
        target: `${process.env.CHATBOT_API_URL}pregenerated/no_tokens`,
        ignorePath: true,
        headers: {
            "chatbot-api-key": process.env.CHATBOT_API_KEY
        },
        onError: (err, req, res) => {
            console.error('Error proxying the request:', err);
            res.status(500).json({ message: 'Error proxying the request' });
        },
    });
}
