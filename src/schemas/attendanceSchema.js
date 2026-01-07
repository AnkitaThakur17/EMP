import { mongoose } from "mongoose";
import tableConstants from "../constants/tableConstants";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      maxLength: 100,
    },
    punchDate: {
      type: String,
    },
    punchInTime: {
      type: String,
    },
    leavingTime: {
      type: String,
    },
    workingHours: {
      type: String,
    },
    punctualStatus: {
      type: String,
      enum: ["On-Time", "Late", "Missing"],
    },
    punchType: {
      type: String,
      enum: ["WEB", "GPS", "KIOSK"],
      default: "WEB",
    },
    
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
  }
);

const AttendanceSchema = mongoose.model(tableConstants.ATTENDANCE, attendanceSchema);

module.exports = AttendanceSchema; 