import * as dotenv from 'dotenv'
dotenv.config()
import * as express from "express"
import { Request, Response } from "express"
import * as session from "express-session";
import * as cors from 'cors'
import helmet from "helmet";
import { ManagementClient, User } from "auth0";
import Stripe from 'stripe';
import { authorize } from './authorize';
import { createProxyMiddleware, Options } from 'http-proxy-middleware';

export const managementAPI = new ManagementClient({
    domain: process.env.AUTH0_DOMAIN,
    clientId: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
});

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2022-11-15',
    appInfo: {
        name: "gdansk-ai",
        version: "0.0.1",
        url: "https://your-page-url"
    }
});

const app = express()
app.use(helmet());

app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "http://localhost:8080", "https://your-page-url", process.env.AUTH0_ISSUER_BASE_URL]
}))

app.use(
    session({
        secret: "Set this to a random string that is kept secure", // TODO use not hardcoded secret
        resave: false,
        saveUninitialized: true,
    })
);

// AI-API proxy
app.post('/question', authorize, async (req, res, next) => {
    let user: User = undefined;

    try {
        await managementAPI
            .getUser(
                {
                    id: req.auth.payload.sub,
                })
            .then(response => {
                user = response;

                if (user.user_metadata?.tokens > 0) { // TODO use customizable value here 
                    try {
                        managementAPI
                            .updateUser(
                                {
                                    id: user.user_id
                                },
                                {
                                    user_metadata: {
                                        tokens: Number.parseInt(user?.user_metadata?.tokens) - 1 //TODO it assumes that one token is one response
                                    }
                                })
                            .then(response => {
                                console.log("Updated number of tokens", response)
                            })
                            .catch(function (err) {
                                console.error("Failed to add metadata to user 1 ", err);
                            });
                    } catch (err) {
                        console.error('Failed to add metadata to user 2 ', err)
                    }
                    next();
                } else {
                    res.status(400).send('No tokens enough');
                    // TODO send voice response
                }
            })
            .catch(function (err) {
                console.error("Failed to fetch user data", err);
            });
    } catch (err) {
        console.error('err', err)
    }
});

const proxyOptions: Options = {
    target: process.env.AI_API_URL,
    changeOrigin: true,
    autoRewrite: true
};

// Proxy middleware
app.post('/question', createProxyMiddleware(proxyOptions));

app.get('/pregenerated/no_tokens', createProxyMiddleware(proxyOptions));
app.get('/pregenerated/not_logged', createProxyMiddleware(proxyOptions));

// Web API
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb' }));

const prefix = '';

export const api = (endpoint: string = '') => `${prefix}${endpoint}`;

app.post('/webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type === 'checkout.session.completed') {
        const sessionId = data.object.id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const session_completed = {
            email: session.customer_email,
            payment_status: session.payment_status,
            session_status: session.status
        };

        let users = await managementAPI
            .getUsersByEmail(session_completed.email);

        if (users.length === 1) {
            try {
                await managementAPI
                    .getUser(
                        {
                            id: users[0].user_id,
                        })
                    .then(response => {
                        const user = response;

                        try {
                            managementAPI
                                .updateUser(
                                    {
                                        id: user.user_id
                                    },
                                    {
                                        user_metadata: {
                                            tokens: Number.parseInt(user?.user_metadata?.tokens ?? '0') + Number.parseInt(process.env.TOKENS_PER_TRANSACTION)
                                        }
                                    })
                                .then(response => {
                                    console.log("Added metadata to user", response)
                                })
                                .catch(function (err) {
                                    console.error("Failed to add metadata to user 1 ", err);
                                });
                        } catch (err) {
                            console.error('Failed to add metadata to user 2 ', err)
                        }
                    })
                    .catch(function (err) {
                        console.error("Failed to fetch user data", err);
                    });
            } catch (err) {
                console.error('err', err)
            }

        }

        res.status(200).send();
    } else {
        res.status(200).send();
    }
});

app.get("/my-tokens", authorize, async (req, res) => {
    let user: User = undefined;

    try {
        await managementAPI
            .getUser(
                {
                    id: req.auth.payload.sub,
                })
            .then(response => {
                user = response;
                res.status(200).json({ 'tokens': user.user_metadata.tokens });
            })
            .catch(function (err) {
                console.error("Failed to fetch user data", err);
            });
    } catch (err) {
        console.error('err', err)
    }
});

app.post('/buy-tokens', authorize, async (req, res) => {
    let user: User = undefined;

    try {
        await managementAPI
            .getUser(
                {
                    id: req.auth.payload.sub,
                })
            .then(response => {
                user = response;
            })
            .catch(function (err) {
                console.error("Failed to fetch user data", err);
            });
    } catch (err) {
        console.error('err', err)
    }

    const session = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
            {
                price: process.env.TOKENS_PRICE_ID,
                quantity: 1,
            },
        ],
        customer_email: user.email,
        mode: 'payment',
        success_url: process.env.CLIENT_URL,
        cancel_url: process.env.CLIENT_URL,
    });

    res.status(200).json({ 'redirectUrl': session.url });
});

app.use(function (req, res, next) {
    console.log("Request to path that doesn't exist")
    const err = new Error('Not Found') as any;
    err.status = 404;
    next(err);
});

// Error handlers
app.use(function (err, req: Request, res: Response, next: express.NextFunction) {
    console.log('Unexpected error', err)
    res.status(err.status || 400).json({ "Error: ": "An error occured" })
});

process.on('uncaughtException', function (err) {
    console.log('uncaughtException', err);
});

console.log('Server started')
app.listen(8080)