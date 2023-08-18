# `🦭 Gdańsk AI 🦭`

Gdańsk AI is a full stack AI voice chatbot (speech-to-text, LLM, text-to-speech) with integrations to Auth0, OpenAI, Google Cloud API and Stripe - Web App, API and AI

<p align="center"><img width="600" src="gdansk-ai.png" alt="Gdańsk AI"></p>

## Web API

It uses [Stripe](https://stripe.com/) to provide payments infrastructure, so users can buy `bibs` - the API tokens. [Auth0](https://auth0.com/) is used to provide authentication and authorization. You can use them for free - Auth0 has a free tier up to 7000 users per month. Stripe only charges fees from purchases, so you have no ongoing costs from any of them.

If you want to use these services, you have to set up your Stripe and Auth0 accounts and put API keys into `.env` in `web-api/` directory.

Node.js, TypeScript and Express are used here

### .env

`.env_example` shows which values you have to set

```
CHATBOT_API_KEY={whatever you decide; this value is reused among ai-api, web-api and web in this project}
OPEN_AI_API_KEY={go to platform.openai.com, generate and copy-paste api key here}
// Google Cloud API
GOOGLE_API_KEY=
type=service_account
project_id={project id}
private_key_id=
private_key={multiline private key with structure like this:-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----\n}
client_email={project name}@{project id}.iam.gserviceaccount.com
client_id=
auth_uri=https://accounts.google.com/o/oauth2/auth
token_uri=https://oauth2.googleapis.com/token
auth_provider_x509_cert_url=https://www.googleapis.com/oauth2/v1/certs
client_x509_cert_url=https://www.googleapis.com/robot/v1/metadata/x509/{project-name}%40{project-id}.iam.gserviceaccount.com
universe_domain=googleapis.com

// Stripe
STRIPE_SECRET_KEY={sk_...}
STRIPE_PUBLISHABLE_KEY={pk_...}
TOKENS_PRICE_ID={price_some characters here - you need to create a price in Stripe for tokens first and then copy-paste it here}
TOKENS_PER_TRANSACTION=5 // you can change it

// Auth0
AUTH0_SECRET=
AUTH0_BASE_URL={url pointing to where web is deployed}
AUTH0_ISSUER_BASE_URL='https://{tenant-name}.us.auth0.com'
AUTH0_DOMAIN='{tenant-name}.us.auth0.com'
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE="https://{tenant-name}.us.auth0.com/api/v2/"
AUTH0_SCOPE="openid profile email offline_access"
CLIENT_URL={url pointing to where web is deployed}
SESSION_SECRET="set_secret_value_here"
BASE_URL={url pointing to where web api is deployed}
AI_API_URL={url pointing to where ai api is deployed}
```

## Web

It works in Google Chrome currently. You can press Gdańsk AI logo to record audio, then press it once again to send it to Web API. After a successful response, a received audio is played to you.

Next.js used here with Vercel's [template](https://vercel.com/templates/next.js/nextjs-boilerplate)

### .env

`.env_example` shows which values you have to set

```
CHATBOT_API_KEY={whatever you decide; this value is reused among ai-api, web-api and web in this project}
CHATBOT_API_URL={url to where api is deployed}

NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL="https://{tenant-name}.us.auth0.com"
NEXT_PUBLIC_AUTH0_CLIENT_ID=
NEXT_PUBLIC_API_URL={url pointing to where api is deployed}
API_URL={url to where api is deployed}
SESSION_SECRET="set_secret_value_here"
NEXT_PUBLIC_SELF_URL={url pointing to where web is deployed}

// Auth0
AUTH0_SECRET=
AUTH0_BASE_URL={url pointing to where web is deployed}
AUTH0_ISSUER_BASE_URL='https://{tenant-name}.us.auth0.com'
AUTH0_DOMAIN='{tenant-name}.us.auth0.com'
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE="https://{tenant-name}.us.auth0.com/api/v2/"
AUTH0_SCOPE="openid profile email offline_access"
CLIENT_URL={url pointing to where web is deployed}
```

## AI API

OpenAI and Google Cloud API are used here to provide speech-to-text (Whisper-1), LLM (gpt-3.5-turbo) and text-to-speech (Google Cloud TextToSpeechClient) services.

Python and FastAPI here

### .env

`.env_example` shows which values you have to set

```
CHATBOT_API_KEY={whatever you decide; this value is reused among ai-api, web-api and web in this project}
OPEN_AI_API_KEY={go to platform.openai.com, generate and copy-paste api key here}
// Google Cloud API start
GOOGLE_API_KEY=
type=service_account
project_id={project id}
private_key_id=
private_key={multiline private key with structure like this:-----BEGIN PRIVATE KEY-----...-----END PRIVATE KEY-----\n}
client_email={project name}@{project id}.iam.gserviceaccount.com
client_id=
auth_uri=https://accounts.google.com/o/oauth2/auth
token_uri=https://oauth2.googleapis.com/token
auth_provider_x509_cert_url=https://www.googleapis.com/oauth2/v1/certs
client_x509_cert_url=https://www.googleapis.com/robot/v1/metadata/x509/{project-name}%40{project-id}.iam.gserviceaccount.com
universe_domain=googleapis.com
PORT=9000
```

## Auth0 setup

Create an account, then a new tenant. You will need to set up:

- Applications: - Applications -> API Explorer Application (Machine to Machine) - Regular Web Application
  APIs: - Auth0 Management API (System API)

## License

GNU GPL v2

## Author

Made in [Gdańsk](https://en.wikipedia.org/wiki/Gda%C5%84sk), [Poland](https://en.wikipedia.org/wiki/Poland) in 2023 by [Jędrzej Paweł Maczan](https://maczan.pl)
