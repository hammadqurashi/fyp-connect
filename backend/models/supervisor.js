import { Schema, model } from "mongoose";

const supervisorSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      unique: true,
    },
    description: {
      type: String,
      required: false,
    },
    department: {
      type: String,
      required: false,
    },
    level: {
      type: String,
      required: false,
      enum: ["professor", "associate_professor", "assistant_professor", "dean", "head_of_department", "lecturer", "other"],
    },
    skills: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
supervisorSchema.index({ userId: 1 });

const SupervisorModel = model("Supervisor", supervisorSchema);

export default SupervisorModel;

