import { Schema, model } from "mongoose";

const userSchema = new Schema(
  {
    firstName: { type: String, required: [true, "Firstname is required."] },
    lastName: { type: String, default: "" },
    email: {
      type: String,
      required: [true, "Email is required."],
      unique: true,
    },
    password: { type: String, required: [true, "Password is required."] },
    role: { type: String, enum: ["student", "supervisor", "admin"] },
    profileImg: { type: String, default: null },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const UserModel = model("User", userSchema);

export default UserModel;
