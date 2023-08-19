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
# Google Cloud API
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

# Stripe
STRIPE_SECRET_KEY={sk_...}
STRIPE_PUBLISHABLE_KEY={pk_...}
TOKENS_PRICE_ID={price_some characters here - you need to create a price in Stripe for tokens first and then copy-paste it here}
# TOKENS_PER_TRANSACTION defines how many interactions user can make with AI per single bibs purchase
TOKENS_PER_TRANSACTION=5

# Auth0
AUTH0_ISSUER_BASE_URL='https://{tenant-name}.us.auth0.com'
AUTH0_DOMAIN='{tenant-name}.us.auth0.com'
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE="https://{tenant-name}.us.auth0.com/api/v2/"
AUTH0_SCOPE="openid profile email offline_access"
CLIENT_URL={url pointing to where web is deployed}
AI_API_URL={url pointing to where ai api is deployed}
```

### Run

- go to `web-api` directory
- `npm install` or `npm ci`
- `npm run build`
- `npm run start` or `npm run dev` to run it with hot-reload

## Web

It works in Google Chrome currently. You can press Gdańsk AI logo to record audio, then press it once again to send it to Web API. After a successful response, a received audio is played to you.

Next.js used here with Vercel's [template](https://vercel.com/templates/next.js/nextjs-boilerplate)

### .env

`.env_example` shows which values you have to set

```
CHATBOT_API_KEY={whatever you decide; this value is reused among ai-api, web-api and web in this project}
CHATBOT_API_URL={url to where api is deployed}


NEXT_PUBLIC_API_URL={url pointing to where api is deployed}
API_URL={url to where api is deployed}

# Auth0
NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL="https://{tenant-name}.us.auth0.com"
NEXT_PUBLIC_AUTH0_CLIENT_ID=
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

### Run

- go to `web` directory
- `npm install` or `npm ci`
- `npm run build`
- install Stripe cli
- `stripe listen --forward-to http://localhost:3000/webhook` (adjust the port from 3000 if you've changed it) - we need this to invoke `/webhook` endpoint on bibs purchases
- `npm run start`

### Troubleshooting

- you might neet to remove/comment out `screen_hint: "signup",` in `signup.ts`

## AI API

OpenAI and Google Cloud API are used here to provide speech-to-text (Whisper-1), LLM (gpt-3.5-turbo) and text-to-speech (Google Cloud TextToSpeechClient) services.

Python and FastAPI here

### .env

`.env_example` shows which values you have to set

```
CHATBOT_API_KEY={whatever you decide; this value is reused among ai-api, web-api and web in this project}
OPEN_AI_API_KEY={go to platform.openai.com, generate and copy-paste api key here}
# Google Cloud API start
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

### Run

- go to `ai-api` directory
- python3 app.py, by default it runs on port 9000

## Auth0 setup

Create an account, then a new tenant. You will need to set up:

- Applications

  - API Explorer Application (Machine to Machine)
    - Client secret taken from here
    - Allow Cross-Origin Authentication
    - Credentials - Authentication Methods - Client Secret (Post)
    - APIs - Auth0 Management API - Authorized and all permissions should be granted in dropdown to the right
  - Regular Web Application
    - Client secret here
    - Allowed Callback URLs: 6 URLs in total in format: url, url/callback, url/api/auth/callback - one url is web api url and another one is for web url (example: http://localhost:8080, http://localhost:8080/callback, http://localhost:8080/api/auth/callback, http://localhost:3000, http://localhost:3000/callback, http://localhost:3000/api/auth/callback; replace localhost and port with with your domain and make sure you use correct protocol http/https)
    - Allowed Logout URLs: URL of web api and web app - http://localhost:3000 and http://localhost:8080 or your domain
    - Allowed Web Origins: URL of web api and web app - http://localhost:8080, your API and AI API domain or your domain
    - Allow Cross-Origin Authentication: Allowed Cors should be web url, your Web API and AI API domain
    - Rotation ON
    - Credentials - Authentication Methods - Client Secret (Post)

- APIs
  - Auth0 Management API (System API):
    - Machine To Machine Applications:
      - add both applications listed above and make sure the switch Authorized to the right is turned on for both
      - add all permissions for both of them, by clicking on dropdown to the right and selecting All permissions and saving

## Stripe setup

Create an account, turn the test mode unless you want to run it on production and process real payments, go to Developers tab, then API keys. This is where you can find values for STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY. Now go to Products tab and Add product which represents a single purchase of bibs (one bib - one interaction with AI for a user). Once you create it, copy priceId and put it into .env as TOKENS_PRICE_ID.

## OpenAI setup

Create an account, go to platform.openai.com, generate API key, use it in .env files

## Google Cloud API setup

Create an account, go to IAM & Admin, then Service Accounts and create a project - you need id of the project to put into .env files. Then you need to generate json with credentials and extract the values from the file to your .env files. Go to Create access credentials page (you can use search engine to find a link). Then Keys -> Add Key -> Create new key -> JSON -> Create. You should get credentials.json with all values you need to .env. Finally, you need to enable text to speech API service and you're ready

## Acknowledgements

Thanks to [Jeff McJunkin](https://github.com/jeffmcjunkin) for improving the README by going through the config process from the scratch and filling the gaps in the docs

## License

GNU GPL v2

## Author

Made in [Gdańsk](https://en.wikipedia.org/wiki/Gda%C5%84sk), [Poland](https://en.wikipedia.org/wiki/Poland) in 2023 by [Jędrzej Paweł Maczan](https://maczan.pl)
