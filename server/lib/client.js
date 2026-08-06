export const client = process.env.NODE_ENV === "DEV" 
  ? process.env.DEV_CORS_ORIGIN 
  : process.env.PROD_CORS_ORIGIN;

export const server = process.env.NODE_ENV === "DEV" 
  ? process.env.SERVER_DEV_URL 
  : process.env.SERVER_PROD_URL;