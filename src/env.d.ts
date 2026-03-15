declare namespace NodeJS {
  interface ProcessEnv {
    API_URL: string;
    SENTRY_KEY: string;
    DEBUG: string;
  }
}