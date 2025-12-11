import { Schema, model } from "mongoose";

const studentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required."],
      unique: true,
    },
    department: {
      type: String,
      required: false,
    },
    completedCreditHours: {
      type: Number,
      required: false,
      min: 0,
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
studentSchema.index({ userId: 1 });

const StudentModel = model("Student", studentSchema);

export default StudentModel;

