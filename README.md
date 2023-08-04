# `🦭 Gdańsk AI 🦭`
Gdańsk AI is a full stack AI voice chatbot (speech-to-text, LLM, text-to-speech) with integrations to Auth0, OpenAI, Google Cloud API and Stripe - Web App, API and AI

<p align="center"><img width="600" src="gdansk-ai.png" alt="Gdańsk AI"></p>

## Web API
It uses [Stripe](https://stripe.com/) to provide payments infrastructure, so users can buy `bibs` - the API tokens. [Auth0](https://auth0.com/) is used to provide authentication and authorization. You can use them for free - Auth0 has a free tier up to 7000 users per month. Stripe only charges fees from purchases, so you have no ongoing costs from any of them.

If you want to use these services, you have to set up your Stripe and Auth0 accounts and put API keys into `.env` in `web-api/` directory.

`env_example` shows which values you have to set

Node.js, TypeScript and Express are used here

## Web
It works in Google Chrome currently. You can press Gdańsk AI logo to record audio, then press it once again to send it to Web API. After a successful response, a received audio is played to you.

`env_example` shows which values you have to set

Next.js used here

## AI API
OpenAI and Google Cloud API are used here to provide speech-to-text (Whisper-1), LLM (gpt-3.5-turbo) and text-to-speech (Google Cloud TextToSpeechClient) services.

`env_example` shows which values you have to set

Python and FastAPI here

## License
GNU GPL v2 

## Author
Made in [Poland](https://en.wikipedia.org/wiki/Poland) in 2023 by [Jędrzej Paweł Maczan](https://maczan.pl)