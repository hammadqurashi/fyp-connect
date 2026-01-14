import connectDB from "../lib/connectDB.js";
import UserModel from "../models/user.js";
import bcrypt from "bcryptjs";

await connectDB();

const password = "test123";

const salt = bcrypt.genSaltSync(10);
const hashedPassword = bcrypt.hashSync(password, salt);

const newAdmin = new UserModel({
  firstName: "IQRA",
  lastName: "Admin",
  email: "admin@fypconnect.com",
  isActive: true,
  password: hashedPassword,
  role: "admin",
});

await newAdmin.save();

console.log("Admin Created successfully");

process.exit();
