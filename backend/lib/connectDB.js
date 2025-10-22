import mongoose from "mongoose";
import { DBConfig } from "../config/index.js";

const connectDB = () => {
  mongoose
    .connect(DBConfig.mongoURI, {
      dbName: DBConfig.dbName,
    })
    .then(() => {
      console.log("DB Connected Sucessfully.");
    })
    .catch((err) => {
      console.log("Error connecting DB", err);
    });
};

export default connectDB;
