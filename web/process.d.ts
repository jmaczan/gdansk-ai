declare namespace NodeJS {
  export interface ProcessEnv {
    NEXTAUTH_URL: string
    NEXTAUTH_SECRET: string
    GITHUB_ID: string
    GITHUB_SECRET: string
    FACEBOOK_ID: string
    FACEBOOK_SECRET: string
    TWITTER_ID: string
    TWITTER_SECRET: string
    GOOGLE_ID: string
    GOOGLE_SECRET: string
    AUTH0_ID: string
    AUTH0_SECRET: string,
    DATABASE_URL: string,
    AUTH0_ISSUER_BASE_URL: string,
    AUTH0_CLIENT_ID: string,
    BASE_URL: string,
    SESSION_SECRET: string,
    SELF_URL: string
  }
}
