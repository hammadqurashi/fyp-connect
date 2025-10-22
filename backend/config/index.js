import { configDotenv } from "dotenv";
configDotenv({ path: ".env" });

export const AppConfig = {
  appPort: process.env.APP_PORT,
  jwtSecret: process.env.JWT_SECRET,
};

export const DBConfig = {
  mongoURI: process.env.MONGO_URI,
  dbName: process.env.DB_NAME,
};
