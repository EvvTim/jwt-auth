const getEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const MONGO_URI = getEnv("MONGO_URI");
export const PORT = Number(getEnv("PORT", "3000"));
export const HOST = getEnv("HOST", "localhost");
export const NODE_ENV = getEnv("NODE_ENV", "development");
export const JWT_SECRET = getEnv("JWT_SECRET");
export const JWT_REFRESH_SECRET = getEnv("JWT_REFRESH_SECRET");
export const EMAIL_SENDER = getEnv("EMAIL_SENDER");
export const EMAIL_SENDER_PASSWORD = getEnv("EMAIL_SENDER_PASSWORD");
export const RESET_API_KEY = getEnv("RESET_API_KEY");
export const APP_ORIGIN = getEnv("APP_ORIGIN");
